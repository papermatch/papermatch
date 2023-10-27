// https://stackoverflow.com/a/76773373
const {
  existsSync,
  mkdirSync,
  lstatSync,
  readdirSync,
  copyFileSync,
} = require("fs");
const { join, basename } = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

const androidFolderPath = ["app", "src", "main", "res"];

const withDrawableAssets = (expoConfig, files) =>
  withDangerousMod(expoConfig, [
    "android",
    (modConfig) => {
      if (modConfig.modRequest.platform === "android") {
        const androidDrawablePath = join(
          modConfig.modRequest.platformProjectRoot,
          ...androidFolderPath
        );
        if (!Array.isArray(files)) {
          files = [files];
        }

        files.forEach((file) => {
          const isFile = lstatSync(file).isFile();
          if (isFile) {
            copyFileSync(file, join(androidDrawablePath, basename(file)));
          } else {
            copyFolderRecursiveSync(file, androidDrawablePath);
          }
        });
      }
      return modConfig;
    },
  ]);

function copyFolderRecursiveSync(source, target) {
  if (!existsSync(target)) mkdirSync(target);

  const files = readdirSync(source);

  files.forEach((file) => {
    const sourcePath = join(source, file);
    const targetPath = join(target, file);

    if (lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  });
}

module.exports = withDrawableAssets;

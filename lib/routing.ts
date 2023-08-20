import { Platform } from "react-native";
import {
  BrowserRouter,
  Route as BrowserRoute,
  Navigate as BrowserNavigate,
  useLocation as useLocationBrowser,
  useNavigate as useNavigateBrowser,
} from "react-router-dom";
import {
  NativeRouter,
  Route as NativeRoute,
  Navigate as NativeNavigate,
  useLocation as useLocationNative,
  useNavigate as useNavigateNative,
} from "react-router-native";

export const ROUTES = {
  ROOT: "/",
  ACCOUNT: "/account",
  AUTH: "/auth",
  OTP: "/otp",
};

export const Router = Platform.OS === "web" ? BrowserRouter : NativeRouter;
export const Route = Platform.OS === "web" ? BrowserRoute : NativeRoute;
export const Navigate =
  Platform.OS === "web" ? BrowserNavigate : NativeNavigate;
export const useLocation =
  Platform.OS === "web" ? useLocationBrowser : useLocationNative;
export const useNavigate =
  Platform.OS === "web" ? useNavigateBrowser : useNavigateNative;

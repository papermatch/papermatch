import { useEffect } from "react";
import { Platform, BackHandler as RNBackHandler } from "react-native";
import {
  BrowserRouter,
  Routes as BrowserRoutes,
  Route as BrowserRoute,
  Navigate as BrowserNavigate,
  Link as BrowserLink,
  useLocation as useLocationBrowser,
  useNavigate as useNavigateBrowser,
  useParams as useParamsBrowser,
} from "react-router-dom";
import {
  NativeRouter,
  Routes as NativeRoutes,
  Route as NativeRoute,
  Navigate as NativeNavigate,
  Link as NativeLink,
  useLocation as useLocationNative,
  useNavigate as useNavigateNative,
  useParams as useParamsNative,
} from "react-router-native";

export const ROUTES = {
  ROOT: "/",
  ABOUT: "about",
  ACCOUNT: "account",
  APP: "app",
  AUTH: "auth",
  BLOCKED: "blocked",
  CREDITS: "credits",
  EDIT: "edit",
  MATCH: "match",
  MATCHES: "matches",
  OTP: "otp",
  PREFERENCES: "preferences",
  PRIVACY: "privacy",
  PROFILE: "profile",
  PROFILES: "profiles",
  REPORT: "report",
};

export const Router = Platform.OS === "web" ? BrowserRouter : NativeRouter;
export const Routes = Platform.OS === "web" ? BrowserRoutes : NativeRoutes;
export const Route = Platform.OS === "web" ? BrowserRoute : NativeRoute;
export const Navigate =
  Platform.OS === "web" ? BrowserNavigate : NativeNavigate;
export const Link = Platform.OS === "web" ? BrowserLink : NativeLink;
export const useLocation =
  Platform.OS === "web" ? useLocationBrowser : useLocationNative;
export const useNavigate =
  Platform.OS === "web" ? useNavigateBrowser : useNavigateNative;
export const useParams =
  Platform.OS === "web" ? useParamsBrowser : useParamsNative;

export const BackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const backAction = () => {
      navigate(-1);
      return true;
    };

    const backHandler = RNBackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigate]);

  return null;
};


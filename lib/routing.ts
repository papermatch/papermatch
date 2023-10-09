import { Platform } from "react-native";
import {
  BrowserRouter,
  Route as BrowserRoute,
  Navigate as BrowserNavigate,
  Link as BrowserLink,
  useLocation as useLocationBrowser,
  useNavigate as useNavigateBrowser,
  useParams as useParamsBrowser,
} from "react-router-dom";
import {
  NativeRouter,
  Route as NativeRoute,
  Navigate as NativeNavigate,
  Link as NativeLink,
  useLocation as useLocationNative,
  useNavigate as useNavigateNative,
  useParams as useParamsNative,
} from "react-router-native";

export const ROUTES = {
  ROOT: "/",
  ACCOUNT: "/account",
  AUTH: "/auth",
  CREDITS: "/credits",
  EDIT: "/edit",
  MATCH: "/match",
  MATCHES: "/matches",
  OTP: "/otp",
  PREFERENCES: "/preferences",
  PROFILE: "/profile",
  PROFILES: "/profiles",
};

export const Router = Platform.OS === "web" ? BrowserRouter : NativeRouter;
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

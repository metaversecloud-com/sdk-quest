import { EggClicked, Error, Home } from "@pages";

export const routes = [
  {
    id: "HOME",
    path: "/",
    component: Home,
    text: "Home",
  },
  {
    id: "Egg-Clicked",
    path: "/egg-clicked",
    component: EggClicked,
    text: "Egg Clicked",
  },
  {
    path: "/error",
    component: Error,
    text: "Error",
  },
];

export default routes;

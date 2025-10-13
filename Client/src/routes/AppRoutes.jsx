import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayoutPublic from "../layouts/LayoutPublic";
import LayoutUser from "../layouts/LayoutUser";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import BoardList from "../pages/boards/BoardList";
import BoardCreate from "../pages/boards/BoardCreate";
import BoardDetail from "../pages/boards/BoardDetail";
import InviteAccept from "../pages/invite/InviteAccept";
import ProtectRouteUser from "./ProtectRouteUser";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutPublic />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "invite/:token", element: <ProtectRouteUser element={<InviteAccept />} />},
    ],
  },

  {
    path: "/app",
    element: <ProtectRouteUser element={<LayoutUser />} />,
    children: [
      { index: true, element: <BoardList /> },
      { path: "create", element: <BoardCreate /> },
      { path: "board/:id", element: <BoardDetail /> },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <>
    <RouterProvider router={router} />
    </>
  )
};

export default AppRoutes;

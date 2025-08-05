import React from "react";
import { useLocation } from "react-router-dom";

export default function Middle() {
  const location = useLocation();
  const { text, type } = location.state || "";
  return <div>{type == "url" ? `已跳转到${text}` : text}</div>;
}

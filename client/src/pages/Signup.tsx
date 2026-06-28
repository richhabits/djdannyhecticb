import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Signup() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/portal/register");
  }, [navigate]);

  return null;
}

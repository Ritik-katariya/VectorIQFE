declare module "react-toastify" {
  import type React from "react";

  export const ToastContainer: React.ComponentType<any>;

  export function toast(message: string, options?: any): void;
  export namespace toast {
    function success(message: string, options?: any): void;
    function error(message: string, options?: any): void;
    function info(message: string, options?: any): void;
    function warn(message: string, options?: any): void;
  }
}

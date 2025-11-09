"use client";

import Image from "next/image";
import logo from "@/public/image/logo.png";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <div className="w-full h-16 bg-gray-100 text-white flex items-center px-4 justify-between shadow-2xl border-b border-gray-200">
      <div className="flex justify-start items-center gap-3">
        <Image src={logo} alt="VectorIQ Logo" width={50} height={50} />
        <h1 className="text-xl font-semibold text-black">VectorIQ</h1>
      </div>
      <div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

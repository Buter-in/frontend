import React, { useState, useContext } from "react";
import { Wallet } from './Wallet.js';
import { Icon } from "./Icon.js";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  return (
    <>
      <div className="fixed flex flex-col justify-between content-center p-4 w-full" style={{ zIndex: 1 }}>
        <div className="flex flex-row w-full justify-between">
          <Icon />
          <Wallet />
        </div>
        
      </div>
    </>
  );
}
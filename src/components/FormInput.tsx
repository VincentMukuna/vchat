import React, { HTMLInputTypeAttribute, useRef, useState } from "react";

type inputProps = {
  label: string;
  value: string | number;
  type: HTMLInputTypeAttribute;
  onChange: (e: any) => void;
  name: string;
  id: string;
};

const FormInput = ({ value, label, onChange, type, name, id }: inputProps) => {
  const input = useRef();

  return (
    <div className="relative text-sm ">
      <label htmlFor={id} className="flex flex-col gap-2 text-indigo-200">
        {label}
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          className="px-2 py-2 bg-transparent border rounded-lg border-indigo-800/50 focus:outline-none focus:border-indigo-600 transition-[border]"
        />
      </label>
    </div>
  );
};

export default FormInput;

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
    <div className="relative text-md dark:text-dark-blue1 ">
      <label
        htmlFor={id}
        className="flex flex-col tracking-wider text-indigo-200 text-dark-blue3/50 dark:text-gray8 focus-within:text-dark-gray3 dark:focus-within:text-gray5"
      >
        {label}
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          className="px-2 py-2 bg-transparent border-b-[0.5px]  invalid:border-dark-tomato10 dark:invalid:border-tomato10  border-b-dark-blue3 focus:outline-none dark:focus:border-dark-blue5 focus:border-dark-blue8 transition-[border] dark:text-white text-dark-blue1"
        />
      </label>
    </div>
  );
};

export default FormInput;

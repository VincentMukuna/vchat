import React from "react";

const GroupDetailsForm =() => (
  <fieldset className="flex flex-col gap-3 space-y-2">
    <div className="relative flex flex-col-reverse gap-2 transition-[height]">
      <input
        max={30}
        type="text"
        id="name"
        required
        value={groupDetails.name}
        onChange={(e) =>
          setGroupDetails({ ...groupDetails, name: e.target.value })
        }
        placeholder="Group Name"
        className="p-2 bg-transparent border-2 rounded w-80 placeholder:text-gray9 placeholder:text-sm peer border-dark-indigo4 focus:outline-none focus:border-dark-indigo7 "
      />
      <label
        htmlFor="name"
        className="text-sm tracking-wider transition-[height] -top-3 left-1 peer-focus:text-gray5 text-gray8 "
      >
        Name :
      </label>
    </div>
    <div className="relative flex flex-col-reverse gap-2">
      <input
        max={50}
        type="text"
        required
        id="description"
        value={groupDetails.description}
        onChange={(e) =>
          setGroupDetails({
            ...groupDetails,
            description: e.target.value,
          })
        }
        placeholder="Few words to describe this group's purpose"
        className="p-2 bg-transparent border-2 rounded w-80 placeholder:text-gray9 placeholder:text-sm peer border-dark-indigo4 focus:outline-none focus:border-dark-indigo7 "
      />
      <label
        htmlFor="descrription"
        className="text-sm tracking-wider peer-focus:text-gray5 text-gray8 "
      >
        Description :
      </label>
    </div>
  </fieldset>
);

export default GroupDetailsForm;

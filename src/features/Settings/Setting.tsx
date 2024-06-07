import { cn } from "@/lib/utils";

function DefaultSetting({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-between p-3",
        className,
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}

function SettingTitle({
  className,
  ...props
}: React.ComponentPropsWithRef<"span">) {
  return (
    <span className={cn("font-semibold", className)} {...props}>
      {props.children}
    </span>
  );
}

function SettingDescription({
  className,
  ...props
}: React.ComponentPropsWithRef<"span">) {
  return (
    <span
      className={cn("text-sm italic dark:text-slate-300", className)}
      {...props}
    >
      {props.children}
    </span>
  );
}

function SettingDetails({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("flex flex-col items-start", className)} {...props}>
      {props.children}
    </div>
  );
}

function SettingAction({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("", className)} {...props}>
      {props.children}
    </div>
  );
}

const Setting = Object.assign(DefaultSetting, {
  Title: SettingTitle,
  Description: SettingDescription,
  Details: SettingDetails,
  Action: SettingAction,
});

export default Setting;

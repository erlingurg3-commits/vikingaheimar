import type { ReactNode } from "react";
import ControlRoomLayout from "@/app/control-room/ControlRoomLayout";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <ControlRoomLayout>{children}</ControlRoomLayout>;
}

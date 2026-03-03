import type { ReactNode } from "react";
import ControlRoomLayout from "./ControlRoomLayout";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <ControlRoomLayout>{children}</ControlRoomLayout>;
}

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface Props {
//   title: string;
//   description: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   children: React.ReactNode;
// }

// export const ResponsiveDialog = ({
//   title,
//   description,
//   open,
//   onOpenChange,
//   children,
// }: Props) => {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="text-white border shadow-xl bg-[#24212d] border-purple-700/20">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <DialogDescription>{description}</DialogDescription>
//         </DialogHeader>
//         {children}
//       </DialogContent>
//     </Dialog>
//   );
// };

import { useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";

interface Props {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const ResponsiveDialog = ({
  title,
  description,
  open,
  onOpenChange,
  children,
}: Props) => {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

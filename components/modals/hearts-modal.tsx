"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useHeartsModal } from "@/store/use-hearts-model";
export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const { isOpen, close } = useHeartsModal();
  useEffect(() => {
    setIsClient(true);
  }, []);

  const onClick = () => {
    close();
    router.push("/store");
  };
  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image
              src={"/mascot_bad.svg"}
              alt="Mascot"
              height={80}
              width={80}
            />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            You ran out of hearts!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get Pro for unlimited hearts, or purchase them in the store.
          </DialogDescription>
          <DialogFooter className="mb-4">
            <div className="flex flex-col gap-y-4 w-full">
              <Button
                variant={"primary"}
                className="w-full"
                size="lg"
                onClick={onClick}
              >
                Get unlimited hearts
              </Button>
              <Button
                variant={"primaryOutline"}
                className="w-full"
                size="lg"
                onClick={close}
              >
                No thanks
              </Button>
            </div>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

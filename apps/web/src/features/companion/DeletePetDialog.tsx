"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { deletePetAction } from "@/server/actions/pets";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   DeletePetDialog — Confirmation modal to delete a companion
   ========================================================================= */

type Pet = Tables<"pets">;

export function DeletePetDialog({
  pet,
  onDeleted,
}: {
  pet: Pet;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deletePetAction(pet.id);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        if (onDeleted) onDeleted();
      }
    });
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        icon={<Trash2 className="h-3.5 w-3.5 text-rose-400" />}
        className="hover:bg-rose-500/10 hover:text-rose-400"
      >
        Delete
      </Button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="glass-card w-full max-w-md p-6 animate-scale-in border-rose-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-3 text-rose-400">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Remove {pet.name}?
            </h2>
          </div>

          <p className="text-sm text-text-secondary mb-6">
            This action will permanently delete {pet.name}&apos;s profile,
            behavioral baselines, and events history. This cannot be undone.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isPending}
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

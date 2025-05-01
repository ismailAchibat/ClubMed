"use client";

import React from "react";
import { cities } from "@/lib/cities";
import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { createIncident, getDoctorNames } from "@/actions/incidents";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const incidentSchema = z.object({
  doctor_name: z.string().min(1, "Le nom du médecin est requis"),
  fullName: z.string().min(1, "Le nom complet est requis"),
  IP: z.string().transform((val) => (val ? parseInt(val) : null)),
  gender: z.enum(["male", "female"]).nullable(),
  incidentDate: z.string().min(1, "La date est requise"),
  incidentTime: z.string().min(1, "L'heure est requise"),
  place: z.string().min(1, "Le lieu est requis"),
  category: z
    .enum(["AIT", "AVC ischémique", "AVC hémorragique", "TVC", "Inconnue"])
    .nullable(),
  diagnosis: z
    .enum([
      "AVC ischémique thrombotique",
      "AVC ischémique embolique",
      "AVC ischémique lacunaire",
      "AVC hémorragique intra-parenchymateux",
      "Hémorragie méningée (sous-arachnoïdienne)",
      "AVC hémorragique intraventriculaire",
      "Infarctus cérébelleux",
      "Thrombose des sinus veineux cérébraux",
      "Dissection artérielle (carotide ou vertébrale)",
      "Non classé / Autre",
    ])
    .nullable(),
  additionalInfo: z.string().nullable(),
  createdAt: z.date().default(() => new Date()),
});


const Page = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorNames, setDoctorNames] = useState<string[]>([]);

  // Pour l'autocomplétion du médecin
  const [doctorInputValue, setDoctorInputValue] = useState("");
  const [doctorSuggestions, setDoctorSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const doctorInputRef = useRef<HTMLInputElement>(null);

  // Fetch doctor names
  useEffect(() => {
    const fetchDoctorNames = async () => {
      const result = await getDoctorNames();
      if (result.success && result.data) {
        setDoctorNames(result.data);
      }
    };
    fetchDoctorNames();
  }, []);

  // Filter doctor suggestions based on input
  useEffect(() => {
    if (doctorInputValue) {
      const filteredSuggestions = doctorNames.filter((name) =>
        name.toLowerCase().includes(doctorInputValue.toLowerCase())
      );
      setDoctorSuggestions(filteredSuggestions);
    } else {
      setDoctorSuggestions([]);
    }
  }, [doctorInputValue, doctorNames]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      doctor_name: doctorInputValue,
      fullName: formData.get("fullName") as string,
      IP: formData.get("IP") as string,
      gender: formData.get("gender") as "male" | "female" | undefined,
      incidentDate: formData.get("incidentDate") as string,
      incidentTime: formData.get("incidentTime") as string,
      place: value || (formData.get("place") as string),
      category: formData.get("category") as any,
      diagnosis: formData.get("diagnosis") as any,
      additionalInfo: formData.get("additionalInfo") as string,
    };

    try {
      const validatedData = incidentSchema.parse(data);
      setIsSubmitting(true);
      const response = await createIncident(validatedData);

      if (response.success) {
        toast.success("Incident enregistré avec succès");
        e.currentTarget.reset();
        setValue("");
        setDoctorInputValue("");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => err.message).join("\n");
        toast.error(errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking outside the suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        doctorInputRef.current &&
        !doctorInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Information Section */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Informations du médecin en charge de la saisie
            </h2>
            <div className="space-y-2">
              <label htmlFor="doctor_name" className="text-sm font-medium">
                Nom Complet du médecin
              </label>
              <div className="relative" ref={doctorInputRef}>
                <input
                  type="text"
                  id="doctor_name"
                  name="doctor_name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Saisir le nom du médecin"
                  value={doctorInputValue}
                  onChange={(e) => {
                    setDoctorInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  autoComplete="off"
                  required
                />
                {showSuggestions && doctorSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {doctorSuggestions.map((name) => (
                            <CommandItem
                              key={name}
                              value={name}
                              onSelect={(value) => {
                                setDoctorInputValue(value);
                                setShowSuggestions(false);
                              }}
                              className="cursor-pointer"
                            >
                              {name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Informations générales sur le patient
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="IP" className="text-sm font-medium">
                  IP
                </label>
                <input
                  type="text"
                  id="IP"
                  name="IP"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Sexe du patient
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner le sexe</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="incidentDate" className="text-sm font-medium">
                    Date de survenu des symptômes
                  </label>
                  <input
                    type="date"
                    id="incidentDate"
                    name="incidentDate"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="incidentTime" className="text-sm font-medium">
                    Heure de survenue des symptômes
                  </label>
                  <input
                    type="time"
                    id="incidentTime"
                    name="incidentTime"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="place" className="text-sm font-medium">
                    Lieu de survenue des symptômes
                  </label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {value
                          ? cities.find((city) => city === value)
                          : "Sélectionner une ville"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher une ville..." />
                        <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                        <ScrollArea className="max-h-60 overflow-auto">
                          <CommandGroup>
                            {cities.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    value === city ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {city}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie générale de l&apos;événement vasculaire cérébral
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="AIT">AIT</option>
                  <option value="AVC ischémique">AVC ischémique</option>
                  <option value="AVC hémorragique">AVC hémorragique</option>
                  <option value="TVC">TVC</option>
                  <option value="Inconnue">Inconnue</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="diagnosis" className="text-sm font-medium">
                  Diagnostic spécifique si confirmé
                </label>
                <select
                  id="diagnosis"
                  name="diagnosis"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner un diagnostic</option>
                  <option value="AVC ischémique thrombotique">
                    AVC ischémique thrombotique
                  </option>
                  <option value="AVC ischémique embolique">
                    AVC ischémique embolique
                  </option>
                  <option value="AVC ischémique lacunaire">
                    AVC ischémique lacunaire
                  </option>
                  <option value="AVC hémorragique intra-parenchymateux">
                    AVC hémorragique intra-parenchymateux
                  </option>
                  <option value="Hémorragie méningée (sous-arachnoïdienne)">
                    Hémorragie méningée (sous-arachnoïdienne)
                  </option>
                  <option value="AVC hémorragique intraventriculaire">
                    AVC hémorragique intraventriculaire
                  </option>
                  <option value="Infarctus cérébelleux">
                    Infarctus cérébelleux
                  </option>
                  <option value="Thrombose des sinus veineux cérébraux">
                    Thrombose des sinus veineux cérébraux
                  </option>
                  <option value="Dissection artérielle (carotide ou vertébrale)">
                    Dissection artérielle (carotide ou vertébrale)
                  </option>
                  <option value="Non classé / Autre">Non classé / Autre</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="additionalInfo" className="text-sm font-medium">
                  Informations supplémentaires
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isSubmitting ? "Enregistrement..." : "Soumettre"}
            </Button>
          </div>
        </form>
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-48"
            onClick={() => (window.location.href = "/admin")}
          >
            Accès admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Incident } from "@/db/schema";
import { logout } from "@/actions/auth";
import { toast } from "sonner";
import { getIncidents } from "@/actions/incidents";
import { Info } from "lucide-react";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    diagnosis: "all",
  });
  const [selectedInfo, setSelectedInfo] = useState<{
    open: boolean;
    content: string;
    patientName: string;
  }>({
    open: false,
    content: "",
    patientName: "",
  });
  const router = useRouter();

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const result = await getIncidents();
      if (result.success) {
        setIncidents(result.data ?? []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des incidents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      incident.doctor_name
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      incident.place.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory =
      filters.category === "all" || incident.category === filters.category;

    const matchesDiagnosis =
      filters.diagnosis === "all" || incident.diagnosis === filters.diagnosis;

    return matchesSearch && matchesCategory && matchesDiagnosis;
  });

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Open info dialog
  const openInfoDialog = (info: string, patientName: string) => {
    setSelectedInfo({
      open: true,
      content: info,
      patientName: patientName,
    });
  };

  // Close info dialog
  const closeInfoDialog = () => {
    setSelectedInfo((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          <Button
            className="cursor-pointer bg-red-100 text-red-700 border border-red-500 hover:bg-red-200 transition-colors"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 mb-6 md:grid-cols-3">
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="AIT">AIT</SelectItem>
              <SelectItem value="AVC ischémique">AVC ischémique</SelectItem>
              <SelectItem value="AVC hémorragique">AVC hémorragique</SelectItem>
              <SelectItem value="TVC">TVC</SelectItem>
              <SelectItem value="Inconnue">Inconnue</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.diagnosis}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, diagnosis: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par diagnostic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les diagnostics</SelectItem>
              <SelectItem value="AVC ischémique thrombotique">
                AVC ischémique thrombotique
              </SelectItem>
              <SelectItem value="AVC ischémique embolique">
                AVC ischémique embolique
              </SelectItem>
              <SelectItem value="AVC ischémique lacunaire">
                AVC ischémique lacunaire
              </SelectItem>
              <SelectItem value="AVC hémorragique intra-parenchymateux">
                AVC hémorragique intra-parenchymateux
              </SelectItem>
              <SelectItem value="Hémorragie méningée (sous-arachnoïdienne)">
                Hémorragie méningée (sous-arachnoïdienne)
              </SelectItem>
              <SelectItem value="AVC hémorragique intraventriculaire">
                AVC hémorragique intraventriculaire
              </SelectItem>
              <SelectItem value="Infarctus cérébelleux">
                Infarctus cérébelleux
              </SelectItem>
              <SelectItem value="Thrombose des sinus veineux cérébraux">
                Thrombose des sinus veineux cérébraux
              </SelectItem>
              <SelectItem value="Dissection artérielle (carotide ou vertébrale)">
                Dissection artérielle (carotide ou vertébrale)
              </SelectItem>
              <SelectItem value="Non classé / Autre">
                Non classé / Autre
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médecin</TableHead>
                <TableHead>IP du patient</TableHead>
                <TableHead>Nom Complet du patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Diagnostic</TableHead>
                <TableHead>Informations supplémentaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Aucun incident trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.doctor_name}</TableCell>
                    <TableCell>{incident.IP}</TableCell>
                    <TableCell>{incident.fullName}</TableCell>
                    <TableCell>
                      {new Date(incident.incidentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{incident.incidentTime}</TableCell>
                    <TableCell>{incident.place}</TableCell>
                    <TableCell>{incident.category}</TableCell>
                    <TableCell>{incident.diagnosis}</TableCell>
                    <TableCell>
                      {incident.additionalInfo ? (
                        <div className="flex items-center gap-2">
                          <span>
                            {truncateText(incident.additionalInfo, 30)}
                          </span>
                          {incident.additionalInfo &&
                            incident.additionalInfo.length > 30 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        openInfoDialog(
                                          incident.additionalInfo ?? "",
                                          incident.fullName
                                        )
                                      }
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Voir les détails</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Non renseigné
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Details Dialog */}
        <Dialog open={selectedInfo.open} onOpenChange={closeInfoDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Informations supplémentaires</DialogTitle>
              <DialogDescription>
                Patient: {selectedInfo.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 max-h-96 overflow-y-auto bg-muted/30 rounded-md whitespace-pre-wrap">
              {selectedInfo.content}
            </div>
            <DialogFooter>
              <Button onClick={closeInfoDialog}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

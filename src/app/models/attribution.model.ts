export interface Attribution {
  _id: string;
  resourceType: 'materiel' | 'consommable' | 'vehicule';
  resourceId: string;
  depotId: number;
  technicianId: number;
  quantity: number;
  date: Date;
  comment?: string;
  createdBy: number;
  action: 'attribution' | 'reprise';
}

export interface Attribution {
  _id?: string;
  resourceType: 'materiel' | 'consommable' | 'vehicule';
  resourceId: number;
  depotId: number;
  technicianId: number;
  quantity?: number;
  date: Date;
  comment?: string;
  authorId?: number;
  action?: 'assignation' | 'retrait';
}

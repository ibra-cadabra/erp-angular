@Component({
  selector: 'app-assign-depot-manager',
  templateUrl: './assign-depot-manager.component.html',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule]
})
export class AssignDepotManagerComponent implements OnInit {
  depots: Depot[] = [];
  availableGerants: User[] = [];
  selectedDepot: Depot | null = null;
  selectedGerant: User | null = null;
  currentGerant: User | null = null;

  constructor(
    private depotService: DepotService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.depotService.fetchDepots();
    this.userService.fetchUsers();

    this.depotService.depots.subscribe(d => this.depots = d);
    this.userService.users().filter(u => u.role === 'gerant')
      .forEach(g => this.availableGerants.push(g));
  }

  loadCurrentGerant() {
    if (!this.selectedDepot) return;
    this.currentGerant = this.userService.users().find(u => u.role === 'gerant' && u.idDep === this.selectedDepot!.idDep) ?? null;
  }

  assignGerant() {
    if (!this.selectedDepot || !this.selectedGerant) return;
    this.userService.assignDepot(this.selectedGerant.idUser, this.selectedDepot.idDep).subscribe(() => {
      this.loadCurrentGerant();
    });
  }

  removeGerant() {
    if (!this.currentGerant) return;
    this.userService.removeDepot(this.currentGerant.idUser).subscribe(() => {
      this.currentGerant = null;
    });
  }
}

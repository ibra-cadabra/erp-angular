import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {map, Observable, of} from "rxjs";

// address.service.ts
export interface AddressSuggestion {
    label: string;
    city: string;
    postaleCode: string;
}

@Injectable({providedIn: 'root'})
export class AddressService {

    constructor(private http: HttpClient) {
    }

    searchStreet(term: string): Observable<AddressSuggestion[]> {
        const trimmed = term.trim();
        if (!trimmed || trimmed.length < 3) {
            return of([]);
        }

        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmed)}&autocomplete=1`;
        return this.http.get<any>(url).pipe(
            map(res =>
                res.features.map((f: any) => ({
                    label: f.properties.label,
                    city: f.properties.city,
                    postaleCode: f.properties.postcode
                }))
            )
        );
    }
}



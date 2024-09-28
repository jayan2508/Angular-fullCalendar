import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { UserData } from '../../utils/interfaces/user.interface';
import { SessionStorageService } from '../session-storage/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/UserData';

  constructor(private http: HttpClient,
    private sessionStorageService: SessionStorageService
  ) {}

  getUsers(): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.apiUrl);
  }

  addUser(user: UserData): Observable<UserData> {
    user.id = uuidv4(); // Generate a UUID for the new user
    return this.http.post<UserData>(this.apiUrl, user);
  }

  checkUserExistence(username: string, email: string): Observable<boolean> {
    return this.getUsers().pipe(
      map((users) =>
        users.some((user) => user.username === username || user.email === email)
      )
    );
  }

  updateUser(user: UserData): Observable<UserData> {
    return this.http.patch<UserData>(`${this.apiUrl}/${user.id}`, user);
  }

  isLoggedIn(): Observable<boolean> {
    return this.getUsers().pipe(
      map((users) => users.some((user) => user.isActive))
    );
  }

  logoutActiveUser(): Observable<UserData | null> {
    // logged-in user ID from session storage
    const loggedInUser = this.sessionStorageService.getItem('loggedInUser');
  
    if (!loggedInUser || !loggedInUser.id) {
      // no user found in session storage, return null
      return of(null);
    }
  
    return this.getUsers().pipe(
      // Find the user with the same ID as the session storage user and is active
      map((users) => users.find((user) => user.id === loggedInUser.id && user.isActive) || null),
      map((user) => {
        if (user) {
          user.isActive = false;
          return user;
        }
        return null;
      }),
      // Update the user data if they exist
      switchMap((user) => (user ? this.updateUser(user) : of(null)))
    );
  }
  
}

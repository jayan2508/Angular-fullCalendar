import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IcalendarData } from '../../utils/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private apiUrl = 'http://localhost:3000/calendarData';

  constructor(private http:HttpClient) { }

  getCalendarData():Observable<IcalendarData[]>  {
    return this.http.get<IcalendarData[]>(this.apiUrl);
  }
  saveCalendarEvent(eventData: any): Observable<IcalendarData[]> {
    eventData.id = uuidv4();
    return this.http.post<IcalendarData[]>(this.apiUrl, eventData);
  }
  
  updateCalendarEvent(eventData: any): Observable<IcalendarData[]> {
    const url = `${this.apiUrl}/${eventData.id}`;
    return this.http.put<IcalendarData[]>(url, eventData);
  }

  updateEvent(eventData: any): Observable<IcalendarData> {
    return this.http.patch<IcalendarData>(`${this.apiUrl}/${eventData.id}`, eventData);
  }

  deleteCalendarEvent(eventId: number): Observable<IcalendarData> {
    return this.http.delete<IcalendarData>(`${this.apiUrl}/${eventId}`);
  }
}

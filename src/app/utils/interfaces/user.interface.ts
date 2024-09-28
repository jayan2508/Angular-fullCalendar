// userData interface

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
}

// calendarData interface

export interface IcalendarData{
  id: string;
  eventTitle: string;
  category: string;
  guest: string;
  allDay: boolean;
  selectedColor: string;
  dateTime:string[] | "";
  userId: string;
  guestEmail: string;
  startStr: string;
  endStr: string;
}
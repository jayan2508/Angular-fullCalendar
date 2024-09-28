import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { HomeService } from '../../../services/home/home.service';
import { SessionStorageService } from '../../../services/session-storage/session-storage.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NzAvatarModule,
    NzIconModule,
    NzLayoutModule,
    FullCalendarModule,
    NzListModule,
    NzMenuModule,
    NzDatePickerModule,
    NzCheckboxModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzModalModule,
    NzInputModule,
    NzTimePickerModule,
    NzSelectModule,
    NzRadioModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  eventForm: FormGroup;
  avatarImageUrl: string = '';
  userInitials: string = '';
  userTooltip: string = '';
  userName: string = '';
  userEmail: string = '';
  eventTitle: string = '';
  category: string = '';
  guest: string = '';
  selectedColor: string = '';
  dateTime: string = '';
  guests: { label: string; value: string }[] = [];
  isDisabled = false;

  @ViewChild('eventModalContent', { static: false })
  eventModalContent!: TemplateRef<any>;

  constructor(
    private router: Router,
    private nzMessageService: NzMessageService,
    private userService: UserService,
    private modalService: NzModalService,
    private homeService: HomeService,
    private fb: FormBuilder,
    private sessionStorageService: SessionStorageService
  ) {
    this.eventForm = this.fb.group({
      eventTitle: ['', Validators.required],
      category: [null, Validators.required],
      guest: [null, Validators.required],
      allDay: [false],
      selectedColor: ['#bcafff'],
      dateTime: [null],
    });
  }

  ngOnInit(): void {
    this.getCalendarData();
    this.getActiveUserInitials();
    this.avatarImageUrl = this.getRandomImageUrl();
    this.loadGuests();
  }

  onAllDayChange(isAllDay: boolean) {
    this.isDisabled = isAllDay;
    if (isAllDay) {
      this.eventForm.get('startTime')?.setValue(null);
      this.eventForm.get('endTime')?.setValue(null);
    }
  }

  getActiveUserInitials(): void {
    const storedUser = this.sessionStorageService.getItem('loggedInUser');

    if (storedUser && storedUser.id) {
      this.userService.getUsers().subscribe((users) => {
        const activeUser = users.find((user) => user.id === storedUser.id);
        if (activeUser) {
          const { firstName, lastName, email } = activeUser;
          this.userInitials = `${firstName.charAt(0)}${lastName.charAt(
            0
          )}`.toUpperCase();
          this.userTooltip = email;
          this.userName = `${firstName} ${lastName.charAt(0)}`.toUpperCase();
          this.userEmail = email;
        }
      });
    }
  }

  loadGuests(): void {
    this.userService.getUsers().subscribe((users) => {
      this.guests = users.map((user) => ({
        label: user.email,
        value: user.email,
      }));
    });
  }

  // full calendar library calendarOptions

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: [],
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.handleDateClick.bind(this),
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
  };

  // event resize

  handleEventResize(arg: { event: any }) {
    const event = arg.event;
  
    const newStartTime = event.startStr; // Start date-time in ISO format
    const newEndTime = event.endStr; // End date-time in ISO format

     // Convert to dateTime array
    const updatedNewDateTime = [newStartTime, newEndTime];
  
    const updatedEventData = {
      id: event.id,
      dateTime: updatedNewDateTime,
      startStr: event.startStr,
      endStr: event.endStr,
    };
  
    this.homeService.updateEvent(updatedEventData).subscribe(
      () => {
        this.nzMessageService.success('Event resized successfully');
        this.getCalendarData(); // get calendar data
      },
      (error) => {
        this.nzMessageService.error('Failed to update event after resizing');
        console.error('Event resize error:', error);
      }
    );
  }  

  // drag and drop event

  handleEventDrop(arg: { event: any }) {
    const event = arg.event;

    const newStart = event.startStr; // Start date-time in ISO format
    const newEnd = event.endStr; // End date-time in ISO format

    // Convert to dateTime array
    const updatedDateTime = [newStart, newEnd];

    const updatedEventData = {
      id: event.id,
      dateTime: updatedDateTime,
      startStr: newStart,
      endStr: newEnd,
    };

    this.homeService.updateEvent(updatedEventData).subscribe(
      () => {
        this.nzMessageService.success('Event date updated successfully');
        this.getCalendarData(); // get calendar data
      },
      (error) => {
        this.nzMessageService.error('Failed to update event');
        console.error('Update event error:', error);
      }
    );
  }

  // date event

  handleDateClick(arg: { dateStr: string }) {
    console.log('Date clicked: ' + arg.dateStr);
  }

  handleSelect(arg: { startStr: string; endStr: string }) {
    // Open event modal
    this.modalService.create({
      nzTitle: 'Create Schedule',
      nzContent: this.eventModalContent,
      nzOnOk: () => this.saveEvent(arg.startStr, arg.endStr),
      nzOnCancel: () => this.resetForm(),
    });
  }

  saveEvent(startStr: string, endStr: string) {
    if (this.eventForm.invalid) {
      this.nzMessageService.error('Please fill in all required fields');
      return;
    }

    // get session storage data
    const loggedInUser = this.sessionStorageService.getItem('loggedInUser');

    if (!loggedInUser || !loggedInUser.id) {
      this.nzMessageService.error('User is not logged in');
      return;
    }

    const eventData = {
      ...this.eventForm.value,
      startStr,
      endStr,
      userId: loggedInUser.id,
      guestEmail: this.eventForm.get('guest')?.value,
    };

    this.homeService.saveCalendarEvent(eventData).subscribe(
      () => {
        this.nzMessageService.success('Event saved successfully');
        this.getCalendarData();
        this.modalService.closeAll();
      },
      (error) => {
        this.nzMessageService.error('Failed to save event');
        console.error('Save event error:', error);
      }
    );
  }

  handleEventClick(arg: { event: any }) {
    const event = arg.event;

    // Pre-fill the form with the event's data
    this.eventForm.patchValue({
      eventTitle: event.title,
      category: event.extendedProps.category,
      guest: event.extendedProps.guest,
      allDay: event.allDay,
      dateTime:
        event.start && event.end
          ? [new Date(event.start), new Date(event.end)]
          : null,
      selectedColor: event.backgroundColor,
    });
    // Set isDisabled based on allDay value
    this.isDisabled = event.allDay;

    // Open edit event modal
    this.modalService.create({
      nzTitle: 'Edit Schedule',
      nzContent: this.eventModalContent,
      nzOnCancel: () => this.resetForm(),
      nzFooter: [
        {
          label: 'Delete',
          type: 'default',
          onClick: () => this.openDeleteConfirmModal(event),
        },
        {
          label: 'Cancel',
          onClick: () => this.modalService.closeAll(),
        },
        {
          label: 'Ok',
          onClick: () => this.updateEvent(event),
        },
      ],
    });
  }

  updateEvent(event: any) {
    // Update the event data
    event.setProp('title', this.eventForm.value.eventTitle);
    event.setExtendedProp('category', this.eventForm.value.category);
    event.setExtendedProp('guest', this.eventForm.value.guest);
    event.setExtendedProp('allDay', this.eventForm.value.allDay);

    event.setStart(this.eventForm.value.startTime);
    event.setEnd(this.eventForm.value.endTime);

    event.setProp('backgroundColor', this.eventForm.value.selectedColor);

    const loggedInUser = this.sessionStorageService.getItem('loggedInUser');

    if (!loggedInUser || !loggedInUser.id) {
      this.nzMessageService.error('User is not logged in');
      return;
    }

    // update the event data
    const updatedEventData = {
      id: event.id,
      ...this.eventForm.value,
      userId: loggedInUser.id,
      guestEmail: this.eventForm.get('guest')?.value,
      startStr: event.startStr,
      endStr: event.endStr,
    };

    this.homeService.updateCalendarEvent(updatedEventData).subscribe(
      () => {
        this.nzMessageService.success('Event updated successfully');
        this.getCalendarData();
        this.modalService.closeAll();
      },
      (error) => {
        this.nzMessageService.error('Failed to update event');
        console.error('Update event error:', error);
      }
    );
  }

  // delete confirm modal

  openDeleteConfirmModal(event: any) {
    this.modalService.create({
      nzTitle: 'Confirm Deletion',
      nzContent: 'Are you sure you want to delete this event?',
      nzOkText: 'Yes',
      nzCancelText: 'No',
      nzOnOk: () => this.deleteEvent(event),
    });
  }

  // delete event function

  deleteEvent(event: any) {
    this.homeService.deleteCalendarEvent(event.id).subscribe(
      () => {
        this.nzMessageService.success('Event deleted successfully');
        this.getCalendarData();
        this.modalService.closeAll();
      },
      (error) => {
        this.nzMessageService.error('Failed to delete event');
        console.error('Delete event error:', error);
      }
    );
  }

  getCalendarData() {
    // logged-in user from session storage
    const loggedInUser = this.sessionStorageService.getItem('loggedInUser');

    if (!loggedInUser || !loggedInUser.id) {
      this.nzMessageService.error('User is not logged in');
      return;
    }

    this.homeService.getCalendarData().subscribe(
      (events) => {
        // Filter events logged-in user or guests email
        const userEvents = events.filter(
          (event) =>
            event.userId === loggedInUser.id ||
            event.guestEmail === loggedInUser.email
        );

        this.calendarOptions = {
          ...this.calendarOptions,
          events: userEvents.map((event) => {
            const hasValidDateTime =
              event.dateTime && event.dateTime.length >= 2;
            const start = hasValidDateTime ? event.dateTime[0] : event.startStr;
            const end = hasValidDateTime ? event.dateTime[1] : event.endStr;

            return {
              id: event.id,
              userId: event.userId,
              title: event.eventTitle,
              start: start ? new Date(start).toISOString() : undefined,
              end: end ? new Date(end).toISOString() : undefined,
              color: event.selectedColor,
              startTime: event.startStr,
              endTime: event.endStr,
              extendedProps: {
                category: event.category,
                guest: event.guestEmail,
              },
              allDay: event.allDay,
            };
          }),
        };
      },
      (error) => {
        this.nzMessageService.error('Failed to load events');
        console.error('Get events error:', error);
      }
    );
  }

  resetForm() {
    this.eventForm.reset({
      selectedColor: '#bcafff',
      allDay: false,
    });
  }

  filter(value: string[]): void {
    console.log(value);
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  confirm(): void {
    this.nzMessageService.info('click confirm');
  }

  goToProfile(): void {
    this.nzMessageService.loading('You have add account');
  }

  logout(): void {
    this.userService.logoutActiveUser().subscribe((user) => {
      if (user) {
        // Remove user data from session storage after logout
        this.sessionStorageService.setItem('loggedInUser', null);
        this.nzMessageService.success('You have logged out');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      } else {
        this.nzMessageService.error('No active user found to log out');
      }
    });
  }

  getRandomImageUrl(): string {
    const images = [
      '../assets/image/example-5.jpg',
      '../assets/image/example-6.jpg',
      '../assets/image/example-7.jpg',
      '../assets/image/example-8.jpg',
      '../assets/image/example-9.jpg',
      '../assets/image/example-10.jpg',
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }
}

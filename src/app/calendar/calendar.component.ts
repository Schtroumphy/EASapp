import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onPrint() {
    window.print();
  }

  calendarOptions: CalendarOptions = {
    themeSystem: 'bootstrap',
    initialView: 'listWeek',
    timeZone: 'UTC',
    editable: true,
    slotDuration: '00:15',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'listDay timeGridWeek dayGridMonth listWeek',
    },
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2020-12-01' },
      { title: 'event 2', date: '2020-12-02' }
    ]
  };

  addEvent() {
    this.calendarComponent.getApi().addEvent({
      title: 'event test',
      start: '2020-12-14T10:30:00',
      end: '2020-12-14T11:30:00',
      extendedProps: {
        department: 'Test'
      },
      description: 'Test Ajout'

    });
    alert('Great. Now, update your database...');
}

handleDateClick(arg) {
  alert('date click! ' + arg.dateStr)
}

}

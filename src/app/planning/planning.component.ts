import { Component, OnInit } from '@angular/core';
import { Calendar } from '@fullcalendar/core'; // include this line
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {

  constructor() { 
    const name = Calendar.name; // add this line in your constructor
  }

  ngOnInit(): void {
  }

  calendarOptions: CalendarOptions = {
    plugins: [ bootstrapPlugin, listPlugin, dayGridPlugin, timeGridPlugin],
    themeSystem: 'bootstrap',
    initialView: 'listWeek',
    timeZone: 'UTC',
    editable:true,
    slotDuration: '00:15',
    headerToolbar: { 
      left: 'prev,next today',
      center: 'title',
      right: 'listDay timeGridWeek dayGridMonth listWeek',
    },
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { 
        title: 'event 1', 
        start: '2020-12-12T10:30:00',
        end: '2020-12-12T11:30:00',
        extendedProps: {
          department: 'BioChemistry'
        },
        description: 'Lecture'
      },
      { 
        title: 'event 1.1', 
        start: '2020-12-12T11:30:00',
        end: '2020-12-12T12:30:00',
        extendedProps: {
          department: 'BioChemistry 1.1'
        },
        description: 'Lecture'
      },
      { 
        title: 'event 1.2', 
        start: '2020-12-12T14:30:00',
        end: '2020-12-12T15:30:00',
        extendedProps: {
          department: 'BioChemistry 1.2'
        },
        description: 'Lecture'
      },
      { title: 'event 2', date: '2020-12-02' },
      
      { title: 'event 3', date: '2020-12-03' },
    ],
    weekends:true,
    eventClick: function(info) {
      alert('Event: ' + info.event.title + ", description : " + info.event.extendedProps.description);
  
      // change the border color just for fun
      info.el.style.borderColor = 'red';
    },
  
  };

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }

}

import { Component, OnInit } from '@angular/core';
import { Calendar } from '@fullcalendar/core'; // include this line
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import bootstrapPlugin from '@fullcalendar/bootstrap';

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
    plugins: [ bootstrapPlugin ],
    themeSystem: 'bootstrap',
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { 
        title: 'event 1', 
        start: '2020-12-12T10:30:00',
        end: '2020-12-13T11:30:00',
        extendedProps: {
          department: 'BioChemistry'
        },
        description: 'Lecture'
      },
      { title: 'event 2', date: '2020-12-02' }
    ],
    weekends:false,
    
  };

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }

}

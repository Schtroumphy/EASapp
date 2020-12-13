import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  placeList: Place[];
  displayForm = false;
  eventForm: FormGroup
  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string
  selectedJourneyId: string
  journeySelected
  calendarApi: Calendar;

  journeyMock = [
    { departure: "Hopital Salut Cren", arrival: "Domicile" },
    { departure: "Hopital Deux Cyr", arrival: "Le François, Bourg" },
    { departure: "Hopital Salut Cren", arrival: "Domicile" },
    { departure: "Carrefour market Robert", arrival: "Hopital Deux Cyr" },
  ]

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  ngAfterViewInit(): void {
    this.calendarApi = this.calendarComponent.getApi();
    this.eventList.forEach((item) => {
      this.addToCalendar(item);
    })
  }

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService) { }

  ngOnInit(): void {
    this.initForm();
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));

    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items,
        console.log(items);
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items,
        console.log(items);
    });
    this.placeService.getPlaces().subscribe((items) => {
      this.placeList = items,
        console.log(items);
    });
  }

  onPrint() {
    window.print();
  }

  calendarOptions: CalendarOptions = {
    locale: 'fr',
    firstDay:1,
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
    titleFormat: { // will produce something like "Tuesday, September 18, 2018"
      month: 'short',
      year: 'numeric',
      day: 'numeric',
      weekday: 'long',
      omitCommas: true,
      hour12: false,
      meridiem: false
    },
    dateClick: this.handleDateClick.bind(this), // bind is important!
    eventClick: function(info) {
      alert(
      'Conducteur: ' + info.event.extendedProps.driver + '\n'+
      'Patient: ' + info.event.extendedProps.driver + '\n'+
      'Départ : ' + info.event.extendedProps.startPoint + '\n'+
      'Arrivée : ' + info.event.extendedProps.endPoint);
  
      // change the border color just for fun
      info.el.style.borderColor = 'green';
    },
    events: [
      { title: 'event 1', date: '2020-12-01', backgroundColor: 'yellow', },
      { title: 'event 2', date: '2020-12-02', backgroundColor: 'rgb(218, 143, 5, 0.753)' },
      { title: 'event 3', date: '2020-12-14T00:00:00.000Z', backgroundColor: 'blue' },
    ]
  };

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }

  //Forms
  initForm() {
    this.eventForm = new FormGroup({
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null),
      journey: new FormControl(null),
    })
  }

  onSubmit() {
    console.log(this.eventForm);

    this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
      (item) => { this.selectedDriver = item });
    console.log("DRIVER SELECTED : " + JSON.stringify(this.selectedDriver))

    this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
      (item) => { this.selectedPatient = item });
    console.log("PATIENT SELECTED : " + JSON.stringify(this.selectedPatient))

    console.log("Date value " + this.eventForm.get('date').value);
    console.log("start hour value " + this.eventForm.get('startHour').value);
    console.log("end hour value " + this.eventForm.get('endHour').value);
    console.log("Départ value " + this.eventForm.get('startPoint').value);
    console.log("Arrivée value " + this.eventForm.get('endPoint').value);

    this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
      (item) => { this.selectedStarPoint = item });
    console.log("Start point SELECTED : " + JSON.stringify(this.selectedStarPoint))

    this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
      (item) => { this.selectedEndPoint = item });
    console.log("End point SELECTED : " + JSON.stringify(this.selectedEndPoint))

    var eventToAddToDB = new Evenement();
    eventToAddToDB.title = this.selectedPatient.firstname + " " + this.selectedPatient.lastname.toUpperCase();
    eventToAddToDB.patient = this.selectedPatient;
    eventToAddToDB.driver = this.selectedDriver
    eventToAddToDB.date = this.eventForm.get('date').value
    eventToAddToDB.startPoint = this.selectedStarPoint
    eventToAddToDB.endPoint = this.selectedEndPoint
    eventToAddToDB.startHour = this.eventForm.get('startHour').value
    eventToAddToDB.endHour = this.eventForm.get('endHour').value

    console.log("Event to add : " + JSON.stringify(eventToAddToDB))

    this.eventService.addEvent(eventToAddToDB).subscribe(
      (events) => {
        this.eventList = events

        this.alertWithSuccess('L\'évènement a été ajouté avec succès')
        this.clearEventForm()
        this.displayForm = false;
        var eventInput = this.convertEventToEventCalendar(eventToAddToDB)
        this.calendarApi.addEvent(eventInput);
      },
      (error) => this.errorAlert()
    );

  }

  addToCalendar(event: Evenement) {
    console.log("Event to add to calendar : " + JSON.stringify(event));
    console.log("EVENT DATE : " + event.date)
    var eventInput = this.convertEventToEventCalendar(event)
    this.calendarApi.addEvent(eventInput);
  }

  convertEventToEventCalendar(event : Evenement){
    console.log("DATE FORMAT");
    var dateEv = event.date;
    var startTimeEv = event.startHour;
    var endTimeEv = event.endHour;

    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    console.log("START DATE TIME : " + dateEv + "T" + startTimeEv);
    console.log("END DATE TIME : " + dateEv + "T" + endTimeEv);
    var eventInput = {
      title: event.patient.lastname.toUpperCase() + " " + event.patient.firstname,
      start: dateEv + "T" + startTimeEv + ":00",
      end: dateEv + "T" + endTimeEv + ":00",
      backgroundColor: 'red',
      extendedProps: {
        driver: event.driver.lastname.toUpperCase() + " " + event.driver.firstname,
        patient: event.patient.lastname.toUpperCase() + " " + event.patient.firstname,
        startPoint: event.startPoint.label,
        endPoint: event.endPoint.label
      },
      description: 'Test Event'
    }
    return eventInput;
    }

  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification de conducteur', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearEventForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  //Ajouter un conducteur
  displayEventForm() {
    this.displayForm = !this.displayForm;
  }

}

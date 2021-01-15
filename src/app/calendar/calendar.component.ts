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
  updateEvent = false;
  eventForm: FormGroup
  displayTimeViewFilter = false
  displayEventClickedDetails = false

  //Form
  newEvent = false;
  updatingEvent = false;

  //drag drop variables
  displayChangesMsg = false;
  eventChangesList: any[]

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
  favoriteTimeView: string

  eventPicked: string;
  calendarApi: Calendar;
  eventToUpdate: Evenement
  eventIdClicked: number;
  eventClicked: any;
  calendarOptions: CalendarOptions
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
    this.initCalendar()
  }

  onPrint() {
    window.print();
  }

  initCalendar() {
    const eventService = this.eventService
    const driverService = this.driverService
    this.calendarOptions = {
      locale: 'fr',
      firstDay: 1,
      displayEventTime: false, // A adapter en fonction de la vue
      slotMinTime: "8:00",
      slotMaxTime: "22:00",
      themeSystem: 'bootstrap',
      initialView: 'listWeek',
      timeZone: 'UTC',
      editable: true,
      droppable: true,
      slotDuration: '00:15',
      buttonText: {
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour',
        list: 'Jour',
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek listWeek',
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
      eventDragStart: function (info) {
        //alert("Event drag start : " + info.event.startStr);
      },
      eventDragStop: this.alertChanges.bind(this),
      eventDrop: this.alertChangesEnd.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: [
        { title: 'event 1', date: '2020-12-01', backgroundColor: 'yellow', },
        { title: 'event 2', date: '2020-12-02', backgroundColor: 'rgb(218, 143, 5, 0.753)' },
      ]
    };
  }

  alertChanges(info) {
    console.log("change loadinng : " + JSON.stringify(info.event))
    this.displayChangesMsg = true;
  }

  alertChangesEnd(info) {
    alert("Event drag stop : " + info.event.startStr);
    console.log("new event : " + JSON.stringify(info.event))
    this.convertEventCalendarToEvent(info.event)
  }

  handleEventClick(event) {
    this.displayEventClickedDetails = true;

    console.log(JSON.stringify(event.event.toPlainObject()));

    this.eventIdClicked = event.event.extendedProps.eventId
    console.log("EVENT ID CLICKED : " + this.eventIdClicked)

    this.eventService.getEventById(event.event.extendedProps.eventId).subscribe(
      (item) => {
        this.eventClicked = item;
        console.log("EVENTS CLICKED : " + JSON.stringify(item))
      });
  }

  //Forms
  initForm() {
    this.eventForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null),
    })
  }

  onSubmit() {
    console.log(this.eventForm);
    console.log("Selected driver id " + this.selectedDriverId);
    console.log("Selected patient id " + this.selectedPatientId);
    console.log("Selected start point id " + this.selectedStartPointId);
    console.log("Selected end point id " + this.selectedEndPointId);

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

    if (this.newEvent) {
      console.log("Submit NEW")
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
    } else if (this.updatingEvent) {
      console.log("Submit UPDATE")
      this.eventService.updateEvent(eventToAddToDB).subscribe(
        (events) => {
          this.eventList = events;
          this.eventList.forEach(element => {
            console.log(JSON.stringify(element))

          });
          this.updateCalendar();
          this.alertWithSuccess('L\'évènement a été modifié avec succès')
          this.clearEventForm()
        }
      )
    }

    console.log("Event to add : " + JSON.stringify(eventToAddToDB))
  }

  addToCalendar(event: Evenement) {
    console.log("Event to add to calendar : " + JSON.stringify(event));
    console.log("EVENT DATE : " + event.date)
    var eventInput = this.convertEventToEventCalendar(event)
    this.calendarApi.addEvent(eventInput);
  }

  updateCalendar() {
    this.calendarApi.removeAllEvents();
    this.eventList.forEach((item) => {
      console.log("New event list : " + JSON.stringify(item))
      this.addToCalendar(item);
    })
  }

  convertEventCalendarToEvent(eventCalendar) {
    console.log("EVENT CALENDAR " + JSON.stringify(eventCalendar))

    var event = new Evenement();
    event.id = eventCalendar.extendedProps.eventId
    event.title = eventCalendar.title
    var date = eventCalendar.start.toString().slice(0, -10)

    console.log("DATE CHANGED : " + date)
    event.startHour = eventCalendar.start.toString().slice(11, 16)
    event.endHour = eventCalendar.end.toString().slice(11, 16)
    console.log("EVENT CONVERTED " + JSON.stringify(event))
  }

  convertEventToEventCalendar(event: Evenement) {
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
        eventId: event.id,
        driverId: event.driver.id,
        patientId: event.patient.id,
        startPointId: event.startPoint.id,
        endPointId: event.endPoint.id
      },
      description: 'Test Event'
    }
    return eventInput;
  }

  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification d\'évènement', message, 'success')
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

  //Ajouter un evenement
  displayEventForm(newEvent: boolean) {
    this.displayForm = !this.displayForm;
    if (newEvent) {
      this.newEvent = true;
      this.updatingEvent = false;
    } else {
      this.updatingEvent = true;
      this.newEvent = false;
    }
    if (!this.displayForm) {
      this.displayForm = !this.displayForm;
    }
  }

  editEvent(event) {
    this.displayEventClickedDetails = false;
    this.displayEventForm(false);
    console.log("Editer : " + JSON.stringify(event))
    this.eventForm.controls["id"].setValue(event.id);
    this.selectedDriverId = event.driver.id;
    this.selectedPatientId = event.patient.id;
    this.selectedStartPointId = event.startPoint.id;
    this.selectedEndPointId = event.endPoint.id;
    this.eventForm.controls["date"].setValue(event.date);
    this.eventForm.controls["startHour"].setValue(event.startHour);
    this.eventForm.controls["endHour"].setValue(event.endHour);
  }

  displayEventDetails(eventId) {
    this.updateEvent = !this.updateEvent;
    this.eventService.getEventById(eventId).subscribe((eventFound) => {
      this.eventToUpdate = eventFound;
    })

  }

  deleteEventBox(eventId) {
    Swal.fire({
      title: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
      text: 'La suppression est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sûr',
      cancelButtonText: 'Non, je le garde'
    }).then((result) => {
      if (result.value) {
        this.eventService
          .deleteEvent(eventId)
          .subscribe(
            (events) => {
              this.eventList = events
              this.eventList.forEach(element => {
                console.log(JSON.stringify(element))

              });
              this.updateCalendar();
              Swal.fire(
                'Supprimé!',
                'L\'évènement a bien été supprimé.',
                'success'
              )
            },
            (error) => {
              Swal.fire(
                'Erreur',
                'Echec de la suppression',
                'error'
              )
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Annulé',
          'Suppression annulée',
          'error'
        )
      }
    })
  }

  favoriteTimeViewChange(event) {
    var target = event.target;
    if (this.favoriteTimeView == "1") { //Morning view 
      this.calendarApi.setOption("slotMinTime", "08:00")
      this.calendarApi.setOption("slotMaxTime", "12:30")
    } else if (this.favoriteTimeView == "2") { //Afternoon view
      this.calendarApi.setOption("slotMinTime", "12:00")
      this.calendarApi.setOption("slotMaxTime", "22:00")
    } else { //All day view
      this.calendarApi.setOption("slotMinTime", "08:00")
      this.calendarApi.setOption("slotMaxTime", "22:00")
    }
  }

  displayEventClicked(hideOrNot) {
    this.displayEventClickedDetails = hideOrNot;
  }

  deleteEventById(eventId) {
    console.log("event id to delete : " + eventId)
    this.deleteEventBox(eventId);
  }

}

import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
import { COLORS } from '../core/constants';
import { DatePipe } from '@angular/common';
import { AdvancedConsoleLogger } from 'typeorm';
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
  displayFilteredForm = false;
  updateEvent = false;
  eventForm: FormGroup
  filterForm: FormGroup
  displayTimeViewFilter = false
  displayEventClickedDetails = false

  //Form
  newEvent = false;
  updatingEvent = false;
  startHourSelected : string;

  //drag drop variables
  displayChangesMsg = false;
  eventChangesList: Evenement[] = []

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
  selectedFilteredDriverId1: string
  selectedFilteredDriverId2: string

  //Map driver-color
  driverColorMap : Map<string,string> = new Map();

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



  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllEvents();
    
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
    this.createDriverColorMap(this.driverList.map(e => e.id), COLORS)
    this.initCalendar()
  }

 createDriverColorMap(keys, vals) {
  var map = new Map()
  keys.forEach(function (key, index) {
    map[key] = vals[index];
  });
  this.driverColorMap = map;
  console.log("Driver-Color MAP : " + JSON.stringify(this.driverColorMap))
}

  getAllEvents() {
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));
  }

  onPrint() {
    window.print();
  }

  initCalendar() {
    this.calendarOptions = {
      locale: 'fr',
      firstDay: 1,
      weekends: false,
      allDaySlot: false,
      allDayText:"Journée entière",
      displayEventTime: false, // A adapter en fonction de la vue
      slotMinTime: "8:00",
      slotMaxTime: "22:00",
      themeSystem: 'bootstrap',
      initialView: 'listWeek',
      timeZone: 'local',
      eventTextColor : 'color',
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
      eventDragStop: null,
      eventDrop: this.alertChangesEnd.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: [
        { title: 'event 1', date: '2020-12-01', backgroundColor: 'yellow', },
        { title: 'event 2', date: '2020-12-02', backgroundColor: 'rgb(218, 143, 5, 0.753)' },
      ]
    };
  }

  alertChangesEnd(info) {
    //Alert the user of changes
    this.displayChangesMsg = true;
    var eventConverted = this.convertEventCalendarToEvent(info.event)

    //Add it to changed event array
    this.eventChangesList.push(eventConverted) 

    console.log("")
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

    this.filterForm = new FormGroup({
      driver1: new FormControl(null, Validators.required),
      driver2: new FormControl(),
    })

    this.filterForm.setValidators(this.checkIfDriverAreSame);
  }

  onFilterSubmit() {
    console.log("Filter form driver 1 : " + this.selectedFilteredDriverId1)
    console.log("Filter form driver 2 : " + this.selectedFilteredDriverId2)
    this.eventList = []
    this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId1)).subscribe((items) => 
      {
        console.log("Events from ZAPHYR Gerald : " + JSON.stringify(items))
        this.eventList = this.eventList.concat(items);
      }
    )
    if(this.selectedFilteredDriverId1 != null){
      this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId2)).subscribe((items) => 
      {
        console.log("Events from ZAPHYR Gerald : " + JSON.stringify(items))
        this.eventList = this.eventList.concat(items);
      }
    )
    }
    
    this.updateCalendar()
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
      eventToAddToDB.id = this.eventForm.get('id').value
      console.log("Submit UPDATE")
      console.log("Event to edit : " + JSON.stringify(eventToAddToDB))
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
    //console.log("Event to add to calendar : " + JSON.stringify(event));
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

  convertEventCalendarToEvent(eventCalendar) : Evenement {
    console.log("EVENT CALENDAR " + JSON.stringify(eventCalendar))
    var event = new Evenement();

    //If event has already been changed and have been add to event list changes
    if(this.eventChangesList.some(e => e.id === eventCalendar.extendedProps.eventId)){
      console.log("Already changed")

      //get event from array thanks to id 
      var eventFound = this.eventChangesList.find(e=> e.id == eventCalendar.extendedProps.eventId)
      this.eventChangesList = this.eventChangesList.filter(obj => obj !== eventFound);

      console.log("Element id " + eventCalendar.extendedProps.eventId + " found : " + JSON.stringify(eventFound))

      //Déjà dans 
      eventFound.date = this.datePipe.transform(eventCalendar.start, 'dd/MM/yyyy')
      //console.log("DATE CHANGED : " + event.date)
      eventFound.startHour = this.datePipe.transform(eventCalendar.start, 'HH:mm' )
      eventFound.endHour = this.datePipe.transform(eventCalendar.end, 'HH:mm' )
      console.log("START DATE  : " + eventCalendar.start)
      console.log("START HOUR  : " + this.datePipe.transform(eventCalendar.start, 'dd/MM/yyyy HH:mm'))
      console.log("START HOUR event : " + eventFound.startHour)
      event = eventFound


    } else {
      //New change
      console.log("NEW CHANGE")
      event.id = eventCalendar.extendedProps.eventId
      event.title = eventCalendar.title
      event.date = this.datePipe.transform(eventCalendar.start, 'yyyy-MM-dd')
      //console.log("DATE CHANGED : " + event.date)
      event.startHour = this.datePipe.transform(eventCalendar.start, 'HH:mm' )
      event.endHour = this.datePipe.transform(eventCalendar.end, 'HH:mm' )
      console.log("START DATE  : " + eventCalendar.start)
      console.log("START HOUR  : " + this.datePipe.transform(eventCalendar.start, 'dd/MM/yyyy HH:mm'))
      console.log("START HOUR event : " + event.startHour)
  
      //Driver
      this.driverService.getDriverById(parseInt(eventCalendar.extendedProps.driverId)).subscribe(
        (item) => { event.driver = item });
      //console.log("Event driver : " + JSON.stringify(event.driver))
  
      //Patient
      this.patientService.getPatientById(parseInt(eventCalendar.extendedProps.patientId)).subscribe(
        (item) => { event.patient = item });
      //console.log("Event patient : " + JSON.stringify(event.patient))
  
      //Places start and end
      this.placeService.getPlaceById(parseInt(eventCalendar.extendedProps.startPointId)).subscribe(
        (item) => { event.startPoint = item });
      //console.log("Event Start point : " + JSON.stringify(event.startPoint))
  
      this.placeService.getPlaceById(parseInt(eventCalendar.extendedProps.endPointId)).subscribe(
        (item) => { event.endPoint = item });
      //console.log("Event End point : " + JSON.stringify(event.endPoint))

    }
    console.log("EVENT CONVERTED " + JSON.stringify(event))
    
    return event;
  }

  convertEventToEventCalendar(event: Evenement) {
    console.log("DATE FORMAT");
    var dateEv = event.date;
    var startTimeEv = event.startHour;
    var endTimeEv = event.endHour;

    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    // console.log("START DATE TIME : " + dateEv + "T" + startTimeEv);
    // console.log("END DATE TIME : " + dateEv + "T" + endTimeEv);
    var eventInput = {
      title: event.patient.firstname+ " " + event.patient.lastname.toUpperCase() ,
      start: dateEv + "T" + startTimeEv + ":00",
      end: dateEv + "T" + endTimeEv + ":00",
      backgroundColor: this.getColorFromId(event.driver.id),
      extendedProps: {
        eventId: event.id,
        driverId: event.driver.id,
        patientId: event.patient.id,
        startPointId: event.startPoint != null ? event.startPoint.id : "null",
        endPointId: event.endPoint != null ? event.endPoint.id : "null",
      },
      description: 'Test Event'
    }
    console.log("Event input : " + JSON.stringify(eventInput))
    return eventInput;
  }

  getColorFromId(id: number) : string{
    console.log("GET COLOR")
    console.log("Driver-Color MAP : " + JSON.stringify(this.driverColorMap))

    console.log("For id " + id + " : " + this.driverColorMap[id])
    return this.driverColorMap[id]
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

  clearFilterForm() {
    this.filterForm.reset()
    this.displayFilteredForm = false
  }

  displayFilterForm(hideOrNot: boolean) {
    (hideOrNot) ? this.displayFilteredForm = true : this.displayFilteredForm = false;
  }

  //Ajouter un evenement
  displayEventForm(newEvent: boolean) {
    this.displayForm = true;
    if (newEvent) {
      this.newEvent = true;
      this.updatingEvent = false;
    } else {
      this.updatingEvent = true;
      this.newEvent = false;
    }
    
  }

  editEvent(event) {
    this.displayEventClickedDetails = false;
    this.displayEventForm(false); //false = not new event
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
              this.displayEventClickedDetails = false;
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

  clearFilter(){
    this.getAllEvents()
    this.updateCalendar()
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

  checkIfDriverAreSame(c: AbstractControl) {
    //safety check
    if (c.get('driver1').value != c.get('driver2').value) {
      return null
    }
    // carry out the actual date checks here for is-endDate-after-startDate
    // if valid, return null,
    // if invalid, return an error object (any arbitrary name), like, return { invalidEndDate: true }
    // make sure it always returns a 'null' for valid or non-relevant cases, and a 'non-null' object for when an error should be raised on the formGroup
  }

  saveChanges(){
    console.log("Save changes")
    this.displayChangesMsg = false
    console.log("EVENT CHANGES LIST : " + JSON.stringify(this.eventChangesList))
    this.eventChangesList.forEach((eventToUpdate)=>{
      this.eventService.updateEvent(eventToUpdate).subscribe(
        (events) => {
          this.eventList = events;
          this.eventList.forEach(element => {
            console.log(JSON.stringify(element))
          });
          this.updateCalendar();
        }
      )
      this.alertWithSuccess('Les modifications ont été pris en compte.')
    })
  }
  
  clearChanges(){
    console.log("Clear changes")
    this.eventChangesList = [];
    console.log("EVENT CHANGES LIST : " + JSON.stringify(this.eventChangesList))
    this.displayChangesMsg = false
    this.updateCalendar()
  }

}



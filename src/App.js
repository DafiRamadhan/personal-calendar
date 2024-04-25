import React, { useState } from "react";
import "./App.css";

const App = () => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [editEventIndex, setEditEventIndex] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [invitees, setInvitees] = useState("");

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    let firstDayOfMonth = new Date(year, month, 1).getDay() - 1;
    if (firstDayOfMonth === -1) {
      firstDayOfMonth = 6;
    }
    return firstDayOfMonth;
  };

  const changeMonth = (amount) => {
    let newMonth = currentMonth + amount;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isValidEmail = (email) => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const eventsFromStorage = JSON.parse(localStorage.getItem("events")) || {};
    const eventsForDate = eventsFromStorage[date] || [];
    setSelectedEvents(eventsForDate);
    setEventModalOpen(true);
  };

  const handleAddEventClick = () => {
    const selectedDateObj = new Date(selectedDate);
    if (selectedDateObj < currentDate.setHours(0, 0, 0, 0)) {
      window.alert("You can't add events for past dates.");
      return;
    }

    if (selectedEvents.length >= 3) {
      window.alert("You can't add more than 3 events for a single day.");
      return;
    }

    setEventName("");
    setEventTime("");
    setInvitees("");
    setEventModalOpen(false);
    setAddEventModalOpen(true);
  };

  const handleEditEventClick = (index) => {
    setEditEventIndex(index);
    setEventName(selectedEvents[index].name);
    setEventTime(selectedEvents[index].time);
    setInvitees(selectedEvents[index].invitees.join("\n"));
    setEventModalOpen(false);
    setEditEventModalOpen(true);
  };

  const handleDeleteEventClick = (index) => {
    const eventsFromStorage = JSON.parse(localStorage.getItem("events")) || {};
    const filteredEvents = (eventsFromStorage[selectedDate] || []).filter(
      (e, i) => i !== index
    );
    const updatedEvents = {
      ...eventsFromStorage,
      [selectedDate]: filteredEvents,
    };
    localStorage.setItem("events", JSON.stringify(updatedEvents));
    setSelectedEvents(filteredEvents);
  };

  const handleAddEventSave = () => {
    if (!eventName || !eventTime || !invitees) {
      window.alert("All forms must be filled in.");
      return;
    }

    const inviteeEmails = invitees.split("\n").map((invitee) => invitee.trim());
    for (const email of inviteeEmails) {
      if (!isValidEmail(email)) {
        alert("Invalid email format.");
        return;
      }
    }

    const randomColor =
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");

    const newEvent = {
      name: eventName,
      time: eventTime,
      invitees: inviteeEmails,
      color: randomColor,
    };

    const eventsFromStorage = JSON.parse(localStorage.getItem("events")) || {};
    const dateString = selectedDate;
    const updatedEvent = [...(eventsFromStorage[dateString] || []), newEvent];
    const updatedEventsData = {
      ...eventsFromStorage,
      [dateString]: updatedEvent,
    };

    localStorage.setItem("events", JSON.stringify(updatedEventsData));
    setSelectedEvents(updatedEvent);
    setAddEventModalOpen(false);
    setEventModalOpen(true);
  };

  const handleEditEventSave = () => {
    if (!eventName || !eventTime || !invitees) {
      window.alert("All forms must be filled in.");
      return;
    }

    const inviteeEmails = invitees.split("\n").map((invitee) => invitee.trim());
    for (const email of inviteeEmails) {
      if (!isValidEmail(email)) {
        alert("Invalid email format.");
        return;
      }
    }

    const updatedEvent = {
      name: eventName,
      time: eventTime,
      invitees: inviteeEmails,
      color: selectedEvents[editEventIndex].color,
    };

    const eventsFromStorage = JSON.parse(localStorage.getItem("events")) || {};
    const dateString = selectedDate;
    const existingEvents = eventsFromStorage[dateString] || [];
    const updatedEvents = existingEvents.map((event, index) =>
      index === editEventIndex ? updatedEvent : event
    );

    const updatedEventsData = {
      ...eventsFromStorage,
      [dateString]: updatedEvents,
    };

    localStorage.setItem("events", JSON.stringify(updatedEventsData));

    setSelectedEvents(updatedEvents);
    setEditEventModalOpen(false);
    setEventModalOpen(true);
  };

  const renderCalendar = () => {
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const weeks = [];

    let date = 1;
    let prevMonthDays = getDaysInMonth(
      currentMonth - 1 < 0 ? 11 : currentMonth - 1,
      currentYear
    );

    for (let i = 0; i < 6; i++) {
      let days = [];
      let nextMonthDays = 0;

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          days.push(
            <div key={`prev-${j}`} className="calendar-day">
              <div className="off-day-number">
                {prevMonthDays - firstDay + j + 1}
              </div>
            </div>
          );
        } else if (date > daysInMonth) {
          days.push(
            <div key={`next-${j}`} className="calendar-day">
              <div className="off-day-number">{date - daysInMonth}</div>
            </div>
          );
          date++;
          nextMonthDays++;
        } else if (date <= daysInMonth) {
          const currentDate = new Date(currentYear, currentMonth, date + 1);
          const dateString = currentDate.toISOString().split("T")[0];
          const events = JSON.parse(localStorage.getItem("events")) || {};
          const eventsOnCurrentDate = events[dateString] || [];
          days.push(
            <div
              key={`${i}-${j}`}
              className="calendar-day"
              onClick={() => handleDateClick(dateString)}
            >
              <div className="day-number">{date}</div>
              <div className="event-list">
                {eventsOnCurrentDate.map((event, index) => (
                  <div
                    key={index}
                    className="event-item"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          );
          date++;
        }
      }

      if (nextMonthDays < 7) {
        weeks.push(
          <div key={i} className="calendar-week">
            {days}
          </div>
        );
      }
    }

    return weeks;
  };

  return (
    <div className="calendar-container">
      <div className="month-header">
        <button onClick={() => changeMonth(-1)}>{"<"}</button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={() => changeMonth(1)}>{">"}</button>
      </div>
      <div className="calendar">
        <div className="days">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <div key={day} className="day">
              {day}
            </div>
          ))}
        </div>
        <div className="render-calendar">{renderCalendar()}</div>
      </div>
      {eventModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setEventModalOpen(false)}
            >
              &#215;
            </button>
            <div className="form-container">
              <h2>Events on {selectedDate}</h2>
              <table className="event-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Invites by email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvents.map((event, index) => (
                    <tr key={index}>
                      <td>{event.name}</td>
                      <td>{event.time}</td>
                      <td>
                        {event.invitees.map((invitee, index) => (
                          <div key={index}>{invitee}</div>
                        ))}
                      </td>
                      <td>
                        <div className="event-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEditEventClick(index)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteEventClick(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="button" onClick={handleAddEventClick}>
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
      {(addEventModalOpen || editEventModalOpen) && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => {
                setEventModalOpen(true);
                addEventModalOpen
                  ? setAddEventModalOpen(false)
                  : setEditEventModalOpen(false);
              }}
            >
              &#215;
            </button>
            <div className="form-container">
              <h2>{addEventModalOpen ? "Add Event" : "Edit Event"}</h2>
              <div className="input-wrapper">
                <label htmlFor="eventName">Name</label>
                <input
                  id="eventName"
                  type="text"
                  className="input-field"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="eventTime">Time</label>
                <input
                  id="eventTime"
                  type="time"
                  className="input-field"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="invitees">
                  Invitees by email (separated with enter)
                </label>
                <textarea
                  id="invitees"
                  className="input-field"
                  value={invitees}
                  rows={5}
                  onChange={(e) => setInvitees(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  style={{ width: "500px", resize: "none" }}
                />
              </div>
              <button
                className="button"
                onClick={
                  addEventModalOpen ? handleAddEventSave : handleEditEventSave
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

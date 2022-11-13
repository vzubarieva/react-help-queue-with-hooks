import React, { useEffect } from "react";
import NewTicketForm from "./NewTicketForm";
import TicketList from "./TicketList";
import EditTicketForm from "./EditTicketForm";
import TicketDetail from "./TicketDetail";
import { useState } from "react";
import db from "./../firebase.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

function TicketControl() {
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     formVisibleOnPage: false,
  //     mainTicketList: [],
  //     selectedTicket: null,
  //     editing: false
  //   };
  // }

  useEffect(() => {
    const unSubscribe = onSnapshot(
      collection(db, "tickets"),
      (collectionSnapshot) => {
        const tickets = [];
        collectionSnapshot.forEach((doc) => {
          tickets.push({
            // names: doc.data().names,
            // location: doc.data().location,
            // issue: doc.data().issue,
            ...doc.data(),
            id: doc.id,
          });
        });
        setMainTicketList(tickets);
      },
      (error) => {
        // do something with error
        setError(error.message);
      }
    );
    return () => unSubscribe();
  }, []);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      // new code!
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  };

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, "tickets", id));
    setSelectedTicket(null);
    // const newMainTicketList = mainTicketList.filter(
    //   (ticket) => ticket.id !== id
    // );
    // setMainTicketList(newMainTicketList);
    // this.setState({
    //   mainTicketList: newMainTicketList,
    //   selectedTicket: null,
    // });
    // setSelectedTicket(null);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditingTicketInList = async (ticketToEdit) => {
    const ticketRef = doc(db, "tickets", ticketToEdit.id);
    await updateDoc(ticketRef, ticketToEdit);
    setEditing(false);
    setSelectedTicket(null);
    // const editedMainTicketList = mainTicketList
    //   .filter((ticket) => ticket.id !== selectedTicket.id)
    //   .concat(ticketToEdit);
    // setMainTicketList(editedMainTicketList);
    // this.setState({
    //   mainTicketList: editedMainTicketList,
    //   editing: false,
    //   selectedTicket: null,
    // });
    // setEditing(false);
    // setSelectedTicket(null);
  };

  const handleAddingNewTicketToList = async (newTicketData) => {
    console.log(db);
    const collectionRef = collection(db, "tickets");
    const res = await addDoc(collectionRef, newTicketData);
    console.log("fb res", res);
    setFormVisibleOnPage(false);
    // const newMainTicketList = mainTicketList.concat(newTicket);
    // setMainTicketList(newMainTicketList);
    // setFormVisibleOnPage(false);
  };

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList.filter((ticket) => ticket.id === id)[0];
    // new code!
    setSelectedTicket(selection);
  };

  // render(){
  let currentlyVisibleState = null;

  let buttonText = null;

  if (error) {
    currentlyVisibleState = <p>There was an error: {error}</p>;
  } else if (editing) {
    currentlyVisibleState = (
      <EditTicketForm
        ticket={selectedTicket}
        onEditTicket={handleEditingTicketInList}
      />
    );
    buttonText = "Return to Ticket List";
  } else if (selectedTicket != null) {
    currentlyVisibleState = (
      <TicketDetail
        ticket={selectedTicket}
        onClickingDelete={handleDeletingTicket}
        onClickingEdit={handleEditClick}
      />
    );
    buttonText = "Return to Ticket List";
  } else if (formVisibleOnPage) {
    currentlyVisibleState = (
      <NewTicketForm onNewTicketCreation={handleAddingNewTicketToList} />
    );
    buttonText = "Return to Ticket List";
  } else {
    currentlyVisibleState = (
      <TicketList
        onTicketSelection={handleChangingSelectedTicket}
        // new code!
        ticketList={mainTicketList}
      />
    );
    buttonText = "Add Ticket";
  }
  return (
    <React.Fragment>
      {currentlyVisibleState}
      {error ? null : <button onClick={handleClick}>{buttonText}</button>}
    </React.Fragment>
  );
}

// }

export default TicketControl;

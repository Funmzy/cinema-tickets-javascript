import TicketService from "./pairtest/TicketService.js";

const Ticket = new TicketService();

const purchaseResponse = Ticket.purchaseTickets(1, [
  { type: "ADULT", noOfTickets: 5},
  { type: "INFANT", noOfTickets: 1},
  { type: "CHILD", noOfTickets: 1},
  
]);

console.log(purchaseResponse);

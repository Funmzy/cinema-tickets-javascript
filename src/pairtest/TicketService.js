import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
 
  constructor() {
    this.TicketTypeRequest = TicketTypeRequest;
    this.InvalidPurchaseException = InvalidPurchaseException;
    this.TicketPaymentService = TicketPaymentService;
    this.SeatReservationService = SeatReservationService;
    this.requests = [];
    this.maxTickets = 20;
    this.minAdultTicket = 1;
    this.adultTicketAmount = 20;
    this.childTicketAmount = 5;
    this.infantTicketAmount = 0;
    this.accountId;
  }
  /**
   * This method takes in an array of ticketTypeRequests. For every element of the array looped through
   * an instance of TicketTypeRequest is created which allows us to get the ticket type and the 
   * number of tickets for each request.
   * @param {{type:string, noOfTickets:number}[]} ticketTypeRequests
   * @return {undefined}
   */
  #ticketTypeRequest(ticketTypeRequests) {
    ticketTypeRequests.forEach((ticketType) => {
      const newRequest = new this.TicketTypeRequest(
        ticketType.type,
        ticketType.noOfTickets
      );
      this.requests.push({
        type: newRequest.getTicketType(),
        noOfTickets: newRequest.getNoOfTickets(),
      });
    });
    this.#validateRequest();
    this.#calcTotalTicketAmount();
    this.#reserveSeats();
    
  }



  
  /**
   * This method calls all the validation methods
   * @return {undefined}
   */
  #validateRequest() {
    this.#validateMinimumNoOfAdultTicket();
    this.#validateNoOfRequest();
    this.#validateInfantTicket();
  }

  /**
   * This method returns the number of tickets for a particular ticket type
   * @param {string} ticketType
   * @returns number
   */
  #getNoOfTickets(ticketType) {
    const request = this.requests.find((item) => item.type === ticketType);
    if (!request) {
      return 0;
    }
    return request.noOfTickets;
  }

  
  /**
   * validation to check that there is atleast one adult ticket in the purchase
   * and also that it is not less than one
   * @return {undefined}
   */
  #validateMinimumNoOfAdultTicket() {
    const noOfAdultTickets = this.#getNoOfTickets("ADULT");
    if (noOfAdultTickets === 0) {
      throw new InvalidPurchaseException(
        "You have to purchase at least one adult ticket"
      );
    }
    if (noOfAdultTickets < this.minAdultTicket) {
      throw new InvalidPurchaseException(
        "Child and Infant tickets cannot be purchased without purchasing an Adult ticket."
      );
    }
  }

  
  /**
   * validation to check that the maximum number of tickets is not greater than 20 tickets
   * @return {undefined}
   */
  #validateNoOfRequest() {
    const noOfRequests = this.requests.reduce(
      (acc, curr) => acc + curr.noOfTickets,
      0
    );
    if (noOfRequests > this.maxTickets) {
      throw new InvalidPurchaseException(
        `Only a maximum of ${this.maxTickets} tickets can be purchased at a time`
      );
    }
  }


  /**
   * validation to check that number of infant ticket is less than or equal to number of adult ticket
   * @return {undefined}
   */
  #validateInfantTicket() {
    const noOfAdultTickets = this.#getNoOfTickets("ADULT");
    const noOfInfantTickets = this.#getNoOfTickets("INFANT");
    if (noOfAdultTickets < noOfInfantTickets) {
      throw new InvalidPurchaseException(
        "Number of Infant tickets cannot be greater than the Number of Adult tickets."
      );
    }
  }


  /**
   * This method is used to calculate the total amount for the tickets purchased
   * @return {undefined}
   */
  #calcTotalTicketAmount() {
    const amountOfAdultTickets =
      this.#getNoOfTickets("ADULT") * this.adultTicketAmount;
    const amountOfInfantTickets =
      this.#getNoOfTickets("INFANT") * this.infantTicketAmount;
    const amountOfChildTickets =
      this.#getNoOfTickets("CHILD") * this.childTicketAmount;
    const totalAmountOfTickets =
      amountOfAdultTickets + amountOfChildTickets + amountOfInfantTickets;
    this.#makePayments(this.accountId, totalAmountOfTickets);
  }

  

  /**
   * This method is used to make a payment request to the `TicketPaymentService`.
   * @param {number} accountId 
   * @param {number} totalAmountOfTickets 
   * @return {undefined}
   */
  #makePayments(accountId, totalAmountOfTickets) {
    const Payment = new this.TicketPaymentService();
    Payment.makePayment(accountId, totalAmountOfTickets);
  }


  
  /**
   * This method is used to calculate the correct number of seats to reserve
   * @returns number
   */
  #getNoOfSeatToAllocate() {
    const noOfAdultSeats = this.#getNoOfTickets("ADULT");
    const noOfChildSeats = this.#getNoOfTickets("CHILD");
    const totalNoOfSeats = noOfAdultSeats + noOfChildSeats;
    return totalNoOfSeats;
  }

  
  /**
   * This method is used to make a seat reservation request to the `SeatReservationService`
   * @return {undefined}
   */
  #reserveSeats() {
    const Reservation = new this.SeatReservationService();
    const noOfSeats = this.#getNoOfSeatToAllocate();
    Reservation.reserveSeat(this.accountId, noOfSeats);
  }

  
  /**
   * This method is to set the account Id
   * @param {number} accountId 
   * @return {undefined}
   */
  #setAccountId(accountId) {
    this.accountId = accountId;
  }

  /**
   * 
   * @param {number} accountId 
   * @param  {{type:string, noOfTickets:number}[]} ticketTypeRequests 
   * @return string
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#setAccountId(accountId);
    this.#ticketTypeRequest(...ticketTypeRequests);
    return "Cinema tickets purchased and seats reservation is successful";
  }
}

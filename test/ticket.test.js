import assert from "assert";
import TicketService from '../src/pairtest/TicketService.js'
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js'


describe("TicketService", function () {
  describe("purchaseTicket", function () {
    it("works fine for a valid purchase request", function () {
      const TicketPurchase = new TicketService()
      const purchaseResponse = TicketPurchase.purchaseTickets(1, [
        { type: "ADULT", noOfTickets: 5 },
        { type: "INFANT", noOfTickets: 3 },
        { type: "CHILD", noOfTickets: 2 },
      ]);
      assert.equal(purchaseResponse, "Cinema tickets purchased and seats reservation is successful")
    });

    it("throws error for an invalid account id", function () {
        const TicketPurchase = new TicketService()
        assert.throws(()=> TicketPurchase.purchaseTickets('1', [
            { type: "ADULT", noOfTickets: 5 },
            { type: "INFANT", noOfTickets: 3 },
            { type: "CHILD", noOfTickets: 2 },
          ]), TypeError)
      });

      it("throws error if maximum number of tickets is greater than 20", function () {
        const TicketPurchase = new TicketService()
        assert.throws(()=> TicketPurchase.purchaseTickets(1, [
            { type: "ADULT", noOfTickets: 5 },
            { type: "INFANT", noOfTickets: 3 },
            { type: "CHILD", noOfTickets: 18},
          ]), InvalidPurchaseException)
      });

      it("throws error if the number of infant tickets is greater than the number of adult tickets", function () {
        const TicketPurchase = new TicketService()
        assert.throws(()=> TicketPurchase.purchaseTickets(1, [
            { type: "ADULT", noOfTickets: 5 },
            { type: "INFANT", noOfTickets: 7},
            { type: "CHILD", noOfTickets: 1},
          ]), InvalidPurchaseException)
      });

      it("throws error if adult ticket is not purchased", function () {
        const TicketPurchase = new TicketService()
        assert.throws(()=> TicketPurchase.purchaseTickets(1, [
            { type: "INFANT", noOfTickets: 7},
            { type: "CHILD", noOfTickets: 1},
          ]), InvalidPurchaseException)
      });

      it("throws error if the ticket type is not valid", function () {
        const TicketPurchase = new TicketService()
        assert.throws(()=> TicketPurchase.purchaseTickets(1, [
            { type: "ADUL", noOfTickets: 7},
            { type: "INFANT", noOfTickets: 7},
            { type: "CHILD", noOfTickets: 1},
          ]), TypeError)
      });
  });
});

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Services", [
      {
        title: "π΅π± OLX.PL",
        serviceDomain: "olx.pl",
        domain: "localhost",
        currencyCode: "PLN",
        lang: "pl",
        countryCode: "pl",
        code: "olx_pl",
      },
      {
        title: "π΅π± INPOST.PL",
        serviceDomain: "inpost.pl",
        domain: "localhost",
        currencyCode: "PLN",
        lang: "pl",
        countryCode: "pl",
        code: "inpost_pl",
      },
      {
        title: "π΅π± POCZTA-POLSKA.PL",
        serviceDomain: "poczta-polska.pl",
        domain: "localhost",
        currencyCode: "PLN",
        lang: "pl",
        countryCode: "pl",
        code: "pocztapolska_pl",
      },
      {
        title: "π΅πΉ OLX.PT",
        serviceDomain: "olx.pt",
        domain: "localhost",
        currencyCode: "EUR",
        lang: "pt",
        countryCode: "pt",
        code: "olx_pt",
      },
      {
        title: "π·π΄ OLX.RO",
        serviceDomain: "olx.ro",
        domain: "localhost",
        currencyCode: "RON",
        lang: "ro",
        countryCode: "ro",
        code: "olx_ro",
      },
      {
        title: "πΈπͺ POSTNORD.SE",
        serviceDomain: "postnord.se",
        domain: "localhost",
        currencyCode: "SEK",
        lang: "se",
        countryCode: "se",
        code: "postnord_se",
      },
      {
        title: "πΈπͺ BLOCKET.SE",
        serviceDomain: "blocket.se",
        domain: "localhost",
        currencyCode: "SEK",
        lang: "se",
        countryCode: "se",
        code: "blocket_se",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Services", null, {
      truncate: true,
    });
  },
};

import { useState, useMemo, useEffect, useCallback } from "react";

const STORAGE_KEY = "aquatracker-peabody-v2";

const SEED_DATA = {
  swimmers: [{"id":1,"name":"Dylan Wellington","age":16,"specialty":"Freestyle"},{"id":2,"name":"Ambrose Teague","age":16,"specialty":"Freestyle"},{"id":3,"name":"Aiden Cusick","age":16,"specialty":"Freestyle"},{"id":4,"name":"Harrys Yankam","age":16,"specialty":"Freestyle"},{"id":5,"name":"Caden Medeiros","age":16,"specialty":"Freestyle"},{"id":6,"name":"Mia Koulopoulos","age":16,"specialty":"Freestyle"},{"id":7,"name":"Justin Nelson","age":16,"specialty":"Freestyle"},{"id":8,"name":"Charlie Wise","age":16,"specialty":"Freestyle"},{"id":9,"name":"Melanie Bradley","age":16,"specialty":"Freestyle"},{"id":10,"name":"Megan Eaton","age":16,"specialty":"Freestyle"},{"id":11,"name":"Patrick Conners","age":16,"specialty":"Freestyle"},{"id":12,"name":"Adelaide Teague","age":16,"specialty":"Freestyle"},{"id":13,"name":"Laque Joseph","age":16,"specialty":"Freestyle"},{"id":14,"name":"Karley O'Connor","age":16,"specialty":"Freestyle"},{"id":15,"name":"Seana Kane","age":16,"specialty":"Freestyle"},{"id":16,"name":"Lillian Brokvist","age":16,"specialty":"Freestyle"},{"id":17,"name":"Elizabeth Olson","age":16,"specialty":"Freestyle"},{"id":18,"name":"Nunez Jesiah","age":16,"specialty":"Freestyle"},{"id":19,"name":"Abigail Troisi","age":16,"specialty":"Freestyle"},{"id":20,"name":"Nell Russell","age":16,"specialty":"Freestyle"},{"id":21,"name":"Mason Gadea","age":16,"specialty":"Freestyle"},{"id":22,"name":"Daria Alic","age":16,"specialty":"Freestyle"},{"id":23,"name":"Charlotte Franco","age":16,"specialty":"Freestyle"},{"id":24,"name":"Megan Burke","age":16,"specialty":"Freestyle"},{"id":25,"name":"Vinaja Allen","age":16,"specialty":"Freestyle"},{"id":26,"name":"Kamille Suplice","age":16,"specialty":"Freestyle"},{"id":27,"name":"Isaiah Mwangi","age":16,"specialty":"Freestyle"}],
  meets: [
    { id: 1, name: "Gloucester",  season: "2024-25" },
    { id: 2, name: "Swampscott",  season: "2024-25" },
    { id: 3, name: "Danvers",     season: "2024-25" },
    { id: 4, name: "Masco",       season: "2024-25" },
    { id: 5, name: "Salem",       season: "2024-25" },
    { id: 6, name: "Marblehead",  season: "2024-25" },
  ],
  times: [{"id":1,"swimmerId":1,"event":"500y Free","time":366.56,"date":"2024-10-01","meet":"Gloucester"},{"id":2,"swimmerId":1,"event":"500y Free","time":369.76,"date":"2024-10-01","meet":"Swampscott"},{"id":3,"swimmerId":2,"event":"50y Free","time":25.25,"date":"2024-10-01","meet":"Masco"},{"id":4,"swimmerId":2,"event":"50y Free","time":25.53,"date":"2024-10-01","meet":"Danvers"},{"id":5,"swimmerId":3,"event":"50y Free","time":25.67,"date":"2024-10-01","meet":"Gloucester"},{"id":6,"swimmerId":1,"event":"50y Free","time":25.89,"date":"2024-10-01","meet":"Gloucester"},{"id":7,"swimmerId":3,"event":"50y Free","time":25.97,"date":"2024-10-01","meet":"Masco"},{"id":8,"swimmerId":3,"event":"50y Free","time":26.13,"date":"2024-10-01","meet":"Swampscott"},{"id":9,"swimmerId":2,"event":"100y Breast","time":76.94,"date":"2024-10-01","meet":"Gloucester"},{"id":10,"swimmerId":4,"event":"200y IM","time":158.94,"date":"2024-10-01","meet":"Danvers"},{"id":11,"swimmerId":3,"event":"50y Free","time":26.25,"date":"2024-10-01","meet":"Danvers"},{"id":12,"swimmerId":5,"event":"100y Breast","time":85.21,"date":"2024-10-01","meet":"Gloucester"},{"id":13,"swimmerId":6,"event":"100y Back","time":72.47,"date":"2024-10-01","meet":"Gloucester"},{"id":14,"swimmerId":2,"event":"50y Free","time":26.34,"date":"2024-10-01","meet":"Swampscott"},{"id":15,"swimmerId":7,"event":"100y Back","time":79.02,"date":"2024-10-01","meet":"Gloucester"},{"id":16,"swimmerId":8,"event":"200y Free","time":145.53,"date":"2024-10-01","meet":"Gloucester"},{"id":17,"swimmerId":9,"event":"200y Free","time":151.27,"date":"2024-10-01","meet":"Gloucester"},{"id":18,"swimmerId":10,"event":"200y Free","time":161.97,"date":"2024-10-01","meet":"Gloucester"},{"id":19,"swimmerId":6,"event":"200y IM","time":166.6,"date":"2024-10-01","meet":"Gloucester"},{"id":20,"swimmerId":2,"event":"50y Free","time":26.37,"date":"2024-10-01","meet":"Salem"},{"id":21,"swimmerId":8,"event":"100y Fly","time":73.65,"date":"2024-10-01","meet":"Gloucester"},{"id":22,"swimmerId":11,"event":"50y Free","time":26.44,"date":"2024-10-01","meet":"Salem"},{"id":23,"swimmerId":11,"event":"50y Free","time":26.57,"date":"2024-10-01","meet":"Swampscott"},{"id":24,"swimmerId":4,"event":"100y Breast","time":80.44,"date":"2024-10-01","meet":"Danvers"},{"id":25,"swimmerId":11,"event":"50y Free","time":26.72,"date":"2024-10-01","meet":"Danvers"},{"id":26,"swimmerId":12,"event":"100y Back","time":95.81,"date":"2024-10-01","meet":"Gloucester"},{"id":27,"swimmerId":9,"event":"100y Breast","time":96.32,"date":"2024-10-01","meet":"Gloucester"},{"id":28,"swimmerId":11,"event":"50y Free","time":26.73,"date":"2024-10-01","meet":"Masco"},{"id":29,"swimmerId":3,"event":"50y Free","time":26.82,"date":"2024-10-01","meet":"Marblehead"},{"id":30,"swimmerId":6,"event":"50y Back","time":32.9,"date":"2024-10-01","meet":"Gloucester"},{"id":31,"swimmerId":5,"event":"100y Breast","time":90.47,"date":"2024-10-01","meet":"Salem"},{"id":32,"swimmerId":7,"event":"50y Fly","time":30.51,"date":"2024-10-01","meet":"Gloucester"},{"id":33,"swimmerId":11,"event":"50y Free","time":26.84,"date":"2024-10-01","meet":"Gloucester"},{"id":34,"swimmerId":1,"event":"50y Free","time":27.3,"date":"2024-10-01","meet":"Gloucester"},{"id":35,"swimmerId":3,"event":"50y Free","time":27.43,"date":"2024-10-01","meet":"Salem"},{"id":36,"swimmerId":4,"event":"200y IM","time":150.13,"date":"2024-10-01","meet":"Gloucester"},{"id":37,"swimmerId":11,"event":"50y Free","time":29.85,"date":"2024-10-01","meet":"Marblehead"},{"id":38,"swimmerId":13,"event":"50y Free","time":31.15,"date":"2024-10-01","meet":"Danvers"},{"id":39,"swimmerId":10,"event":"50y Free","time":31.22,"date":"2024-10-01","meet":"Danvers"},{"id":40,"swimmerId":3,"event":"50y Back","time":31.74,"date":"2024-10-01","meet":"Gloucester"},{"id":41,"swimmerId":2,"event":"50y Breast","time":33.13,"date":"2024-10-01","meet":"Gloucester"},{"id":42,"swimmerId":8,"event":"50y Free","time":31.62,"date":"2024-10-01","meet":"Gloucester"},{"id":43,"swimmerId":14,"event":"200y IM","time":201.69,"date":"2024-10-01","meet":"Gloucester"},{"id":44,"swimmerId":4,"event":"100y Fly","time":74.81,"date":"2024-10-01","meet":"Gloucester"},{"id":45,"swimmerId":13,"event":"50y Free","time":32.33,"date":"2024-10-01","meet":"Gloucester"},{"id":46,"swimmerId":15,"event":"100y Fly","time":86.51,"date":"2024-10-01","meet":"Gloucester"},{"id":47,"swimmerId":9,"event":"50y Free","time":32.77,"date":"2024-10-01","meet":"Gloucester"},{"id":48,"swimmerId":5,"event":"100y Breast","time":86.09,"date":"2024-10-01","meet":"Swampscott"},{"id":49,"swimmerId":10,"event":"50y Free","time":33.22,"date":"2024-10-01","meet":"Masco"},{"id":50,"swimmerId":1,"event":"50y Free","time":33.4,"date":"2024-10-01","meet":"Marblehead"},{"id":51,"swimmerId":14,"event":"50y Free","time":34.64,"date":"2024-10-01","meet":"Gloucester"},{"id":52,"swimmerId":13,"event":"50y Free","time":35.78,"date":"2024-10-01","meet":"Salem"},{"id":53,"swimmerId":16,"event":"50y Free","time":36.78,"date":"2024-10-01","meet":"Salem"},{"id":54,"swimmerId":17,"event":"50y Free","time":37.75,"date":"2024-10-01","meet":"Gloucester"},{"id":55,"swimmerId":17,"event":"50y Free","time":37.78,"date":"2024-10-01","meet":"Danvers"},{"id":56,"swimmerId":4,"event":"50y Free","time":29.24,"date":"2024-10-01","meet":"Gloucester"},{"id":57,"swimmerId":2,"event":"100y Breast","time":81.38,"date":"2024-10-01","meet":"Marblehead"},{"id":58,"swimmerId":4,"event":"50y Fly","time":30.46,"date":"2024-10-01","meet":"Gloucester"},{"id":59,"swimmerId":6,"event":"100y Back","time":72.01,"date":"2024-10-01","meet":"Marblehead"},{"id":60,"swimmerId":18,"event":"50y Free","time":38.08,"date":"2024-10-01","meet":"Danvers"},{"id":61,"swimmerId":1,"event":"500y Free","time":370.12,"date":"2024-10-01","meet":"Danvers"},{"id":62,"swimmerId":7,"event":"100y Back","time":83.97,"date":"2024-10-01","meet":"Marblehead"},{"id":63,"swimmerId":15,"event":"100y Back","time":88.19,"date":"2024-10-01","meet":"Marblehead"},{"id":64,"swimmerId":9,"event":"200y Free","time":154.93,"date":"2024-10-01","meet":"Marblehead"},{"id":65,"swimmerId":8,"event":"200y IM","time":164.5,"date":"2024-10-01","meet":"Marblehead"},{"id":66,"swimmerId":13,"event":"50y Free","time":38.09,"date":"2024-10-01","meet":"Masco"},{"id":67,"swimmerId":5,"event":"100y Breast","time":87.78,"date":"2024-10-01","meet":"Masco"},{"id":68,"swimmerId":8,"event":"100y Fly","time":73.44,"date":"2024-10-01","meet":"Marblehead"},{"id":69,"swimmerId":17,"event":"200y Free","time":204.69,"date":"2024-10-01","meet":"Marblehead"},{"id":70,"swimmerId":7,"event":"200y IM","time":178.65,"date":"2024-10-01","meet":"Marblehead"},{"id":71,"swimmerId":6,"event":"100y Fly","time":74.41,"date":"2024-10-01","meet":"Marblehead"},{"id":72,"swimmerId":18,"event":"50y Free","time":38.24,"date":"2024-10-01","meet":"Gloucester"},{"id":73,"swimmerId":19,"event":"100y Back","time":115.33,"date":"2024-10-01","meet":"Marblehead"},{"id":74,"swimmerId":15,"event":"200y IM","time":192.56,"date":"2024-10-01","meet":"Marblehead"},{"id":75,"swimmerId":7,"event":"500y Free","time":375.76,"date":"2024-10-01","meet":"Masco"},{"id":76,"swimmerId":7,"event":"500y Free","time":382.32,"date":"2024-10-01","meet":"Gloucester"},{"id":77,"swimmerId":16,"event":"100y Breast","time":108.02,"date":"2024-10-01","meet":"Marblehead"},{"id":78,"swimmerId":20,"event":"50y Free","time":38.32,"date":"2024-10-01","meet":"Masco"},{"id":79,"swimmerId":18,"event":"50y Free","time":38.96,"date":"2024-10-01","meet":"Masco"},{"id":80,"swimmerId":20,"event":"50y Free","time":39.41,"date":"2024-10-01","meet":"Salem"},{"id":81,"swimmerId":2,"event":"100y Breast","time":77.29,"date":"2024-10-01","meet":"Salem"},{"id":82,"swimmerId":6,"event":"100y Back","time":73.94,"date":"2024-10-01","meet":"Salem"},{"id":83,"swimmerId":4,"event":"100y Fly","time":71.4,"date":"2024-10-01","meet":"Marblehead"},{"id":84,"swimmerId":21,"event":"50y Free","time":39.71,"date":"2024-10-01","meet":"Danvers"},{"id":85,"swimmerId":17,"event":"50y Free","time":39.82,"date":"2024-10-01","meet":"Swampscott"},{"id":86,"swimmerId":7,"event":"500y Free","time":382.44,"date":"2024-10-01","meet":"Danvers"},{"id":87,"swimmerId":8,"event":"100y Fly","time":73.06,"date":"2024-10-01","meet":"Salem"},{"id":88,"swimmerId":5,"event":"100y Breast","time":85.65,"date":"2024-10-01","meet":"Danvers"},{"id":89,"swimmerId":8,"event":"200y Free","time":142.66,"date":"2024-10-01","meet":"Salem"},{"id":90,"swimmerId":15,"event":"200y Free","time":171.0,"date":"2024-10-01","meet":"Salem"},{"id":91,"swimmerId":14,"event":"200y Free","time":180.69,"date":"2024-10-01","meet":"Salem"},{"id":92,"swimmerId":6,"event":"200y IM","time":170.14,"date":"2024-10-01","meet":"Salem"},{"id":93,"swimmerId":4,"event":"100y Breast","time":83.72,"date":"2024-10-01","meet":"Marblehead"},{"id":94,"swimmerId":1,"event":"500y Free","time":387.05,"date":"2024-10-01","meet":"Masco"},{"id":95,"swimmerId":9,"event":"500y Free","time":388.62,"date":"2024-10-01","meet":"Danvers"},{"id":96,"swimmerId":7,"event":"100y Back","time":89.82,"date":"2024-10-01","meet":"Salem"},{"id":97,"swimmerId":14,"event":"100y Breast","time":100.69,"date":"2024-10-01","meet":"Salem"},{"id":98,"swimmerId":19,"event":"50y Free","time":40.58,"date":"2024-10-01","meet":"Swampscott"},{"id":99,"swimmerId":22,"event":"50y Free","time":40.59,"date":"2024-10-01","meet":"Swampscott"},{"id":100,"swimmerId":21,"event":"50y Free","time":41.16,"date":"2024-10-01","meet":"Masco"},{"id":101,"swimmerId":23,"event":"100y Back","time":111.44,"date":"2024-10-01","meet":"Salem"},{"id":102,"swimmerId":22,"event":"50y Free","time":41.78,"date":"2024-10-01","meet":"Salem"},{"id":103,"swimmerId":23,"event":"50y Free","time":42.25,"date":"2024-10-01","meet":"Danvers"},{"id":104,"swimmerId":19,"event":"50y Free","time":42.42,"date":"2024-10-01","meet":"Salem"},{"id":105,"swimmerId":5,"event":"100y Fly","time":94.03,"date":"2024-10-01","meet":"Masco"},{"id":106,"swimmerId":1,"event":"100y Fly","time":76.25,"date":"2024-10-01","meet":"Salem"},{"id":107,"swimmerId":24,"event":"50y Free","time":42.78,"date":"2024-10-01","meet":"Salem"},{"id":108,"swimmerId":21,"event":"50y Free","time":43.03,"date":"2024-10-01","meet":"Swampscott"},{"id":109,"swimmerId":19,"event":"100y Back","time":122.78,"date":"2024-10-01","meet":"Salem"},{"id":110,"swimmerId":17,"event":"100y Breast","time":159.81,"date":"2024-10-01","meet":"Salem"},{"id":111,"swimmerId":25,"event":"50y Free","time":43.63,"date":"2024-10-01","meet":"Gloucester"},{"id":112,"swimmerId":25,"event":"50y Free","time":43.96,"date":"2024-10-01","meet":"Swampscott"},{"id":113,"swimmerId":9,"event":"500y Free","time":398.26,"date":"2024-10-01","meet":"Swampscott"},{"id":114,"swimmerId":23,"event":"50y Free","time":44.09,"date":"2024-10-01","meet":"Masco"},{"id":115,"swimmerId":26,"event":"50y Free","time":44.38,"date":"2024-10-01","meet":"Danvers"},{"id":116,"swimmerId":8,"event":"200y IM","time":160.93,"date":"2024-10-01","meet":"Swampscott"},{"id":117,"swimmerId":4,"event":"200y IM","time":161.38,"date":"2024-10-01","meet":"Masco"},{"id":118,"swimmerId":4,"event":"100y Breast","time":80.32,"date":"2024-10-01","meet":"Masco"},{"id":119,"swimmerId":6,"event":"100y Back","time":72.97,"date":"2024-10-01","meet":"Swampscott"},{"id":120,"swimmerId":8,"event":"100y Fly","time":72.87,"date":"2024-10-01","meet":"Swampscott"},{"id":121,"swimmerId":9,"event":"500y Free","time":403.28,"date":"2024-10-01","meet":"Marblehead"},{"id":122,"swimmerId":1,"event":"200y Free","time":134.14,"date":"2024-10-01","meet":"Swampscott"},{"id":123,"swimmerId":7,"event":"100y Back","time":79.14,"date":"2024-10-01","meet":"Swampscott"},{"id":124,"swimmerId":5,"event":"100y Fly","time":93.44,"date":"2024-10-01","meet":"Danvers"},{"id":125,"swimmerId":9,"event":"200y Free","time":152.38,"date":"2024-10-01","meet":"Swampscott"},{"id":126,"swimmerId":15,"event":"200y Free","time":164.85,"date":"2024-10-01","meet":"Swampscott"},{"id":127,"swimmerId":7,"event":"200y IM","time":176.19,"date":"2024-10-01","meet":"Swampscott"},{"id":128,"swimmerId":1,"event":"500y Free","time":406.09,"date":"2024-10-01","meet":"Salem"},{"id":129,"swimmerId":12,"event":"100y Back","time":100.32,"date":"2024-10-01","meet":"Swampscott"},{"id":130,"swimmerId":6,"event":"100y Fly","time":75.72,"date":"2024-10-01","meet":"Swampscott"},{"id":131,"swimmerId":27,"event":"200y IM","time":193.81,"date":"2024-10-01","meet":"Swampscott"},{"id":132,"swimmerId":14,"event":"100y Breast","time":101.22,"date":"2024-10-01","meet":"Swampscott"},{"id":133,"swimmerId":9,"event":"200y Free","time":156.6,"date":"2024-10-01","meet":"Masco"},{"id":134,"swimmerId":1,"event":"200y Free","time":149.09,"date":"2024-10-01","meet":"Masco"},{"id":135,"swimmerId":10,"event":"200y Free","time":161.46,"date":"2024-10-01","meet":"Masco"},{"id":136,"swimmerId":8,"event":"200y IM","time":163.04,"date":"2024-10-01","meet":"Masco"},{"id":137,"swimmerId":4,"event":"200y IM","time":161.22,"date":"2024-10-01","meet":"Salem"},{"id":138,"swimmerId":15,"event":"200y IM","time":183.9,"date":"2024-10-01","meet":"Masco"},{"id":139,"swimmerId":2,"event":"100y Free","time":56.89,"date":"2024-10-01","meet":"Danvers"},{"id":140,"swimmerId":2,"event":"100y Free","time":57.62,"date":"2024-10-01","meet":"Masco"},{"id":141,"swimmerId":2,"event":"100y Free","time":57.85,"date":"2024-10-01","meet":"Marblehead"},{"id":142,"swimmerId":2,"event":"100y Free","time":58.03,"date":"2024-10-01","meet":"Gloucester"},{"id":143,"swimmerId":2,"event":"100y Free","time":58.15,"date":"2024-10-01","meet":"Swampscott"},{"id":144,"swimmerId":1,"event":"100y Free","time":58.69,"date":"2024-10-01","meet":"Marblehead"},{"id":145,"swimmerId":11,"event":"100y Free","time":62.12,"date":"2024-10-01","meet":"Gloucester"},{"id":146,"swimmerId":11,"event":"100y Free","time":62.18,"date":"2024-10-01","meet":"Masco"},{"id":147,"swimmerId":11,"event":"100y Free","time":63.25,"date":"2024-10-01","meet":"Danvers"},{"id":148,"swimmerId":11,"event":"100y Free","time":65.22,"date":"2024-10-01","meet":"Marblehead"},{"id":149,"swimmerId":6,"event":"100y Fly","time":77.18,"date":"2024-10-01","meet":"Masco"},{"id":150,"swimmerId":8,"event":"100y Fly","time":74.46,"date":"2024-10-01","meet":"Masco"},{"id":151,"swimmerId":5,"event":"100y Free","time":72.15,"date":"2024-10-01","meet":"Marblehead"},{"id":152,"swimmerId":11,"event":"100y Free","time":65.5,"date":"2024-10-01","meet":"Salem"},{"id":153,"swimmerId":11,"event":"100y Free","time":65.76,"date":"2024-10-01","meet":"Swampscott"},{"id":154,"swimmerId":27,"event":"100y Free","time":70.93,"date":"2024-10-01","meet":"Gloucester"},{"id":155,"swimmerId":5,"event":"200y Free","time":172.65,"date":"2024-10-01","meet":"Marblehead"},{"id":156,"swimmerId":7,"event":"500y Free","time":432.1,"date":"2024-10-01","meet":"Salem"},{"id":157,"swimmerId":15,"event":"500y Free","time":441.41,"date":"2024-10-01","meet":"Swampscott"},{"id":158,"swimmerId":19,"event":"100y Back","time":114.83,"date":"2024-10-01","meet":"Masco"},{"id":159,"swimmerId":7,"event":"100y Back","time":80.81,"date":"2024-10-01","meet":"Masco"},{"id":160,"swimmerId":6,"event":"100y Back","time":73.81,"date":"2024-10-01","meet":"Masco"},{"id":161,"swimmerId":12,"event":"100y Back","time":95.46,"date":"2024-10-01","meet":"Masco"},{"id":162,"swimmerId":14,"event":"100y Breast","time":101.5,"date":"2024-10-01","meet":"Masco"},{"id":163,"swimmerId":12,"event":"200y Free","time":180.66,"date":"2024-10-01","meet":"Danvers"},{"id":164,"swimmerId":9,"event":"200y Free","time":149.57,"date":"2024-10-01","meet":"Danvers"},{"id":165,"swimmerId":1,"event":"200y Free","time":135.34,"date":"2024-10-01","meet":"Danvers"},{"id":166,"swimmerId":27,"event":"200y Free","time":166.35,"date":"2024-10-01","meet":"Danvers"},{"id":167,"swimmerId":8,"event":"200y IM","time":160.65,"date":"2024-10-01","meet":"Danvers"},{"id":168,"swimmerId":4,"event":"100y Fly","time":71.02,"date":"2024-10-01","meet":"Swampscott"},{"id":169,"swimmerId":15,"event":"200y IM","time":180.34,"date":"2024-10-01","meet":"Danvers"},{"id":170,"swimmerId":19,"event":"100y Free","time":74.38,"date":"2024-10-01","meet":"Danvers"},{"id":171,"swimmerId":27,"event":"100y Free","time":74.38,"date":"2024-10-01","meet":"Danvers"},{"id":172,"swimmerId":10,"event":"100y Free","time":75.19,"date":"2024-10-01","meet":"Swampscott"},{"id":173,"swimmerId":15,"event":"100y Free","time":77.81,"date":"2024-10-01","meet":"Masco"},{"id":174,"swimmerId":10,"event":"100y Free","time":78.22,"date":"2024-10-01","meet":"Salem"},{"id":175,"swimmerId":20,"event":"100y Free","time":86.5,"date":"2024-10-01","meet":"Gloucester"},{"id":176,"swimmerId":17,"event":"100y Free","time":92.72,"date":"2024-10-01","meet":"Salem"},{"id":177,"swimmerId":8,"event":"100y Fly","time":73.68,"date":"2024-10-01","meet":"Danvers"},{"id":178,"swimmerId":6,"event":"100y Fly","time":76.07,"date":"2024-10-01","meet":"Danvers"},{"id":179,"swimmerId":5,"event":"50y Breast","time":37.05,"date":"2024-10-01","meet":"Gloucester"},{"id":180,"swimmerId":22,"event":"100y Free","time":93.63,"date":"2024-10-01","meet":"Masco"},{"id":181,"swimmerId":19,"event":"100y Free","time":94.71,"date":"2024-10-01","meet":"Gloucester"},{"id":182,"swimmerId":19,"event":"100y Free","time":100.54,"date":"2024-10-01","meet":"Salem"},{"id":183,"swimmerId":15,"event":"500y Free","time":467.42,"date":"2024-10-01","meet":"Salem"},{"id":184,"swimmerId":5,"event":"500y Free","time":488.95,"date":"2024-10-01","meet":"Gloucester"},{"id":185,"swimmerId":1,"event":"500y Free","time":541.34,"date":"2024-10-01","meet":"Marblehead"},{"id":186,"swimmerId":20,"event":"100y Back","time":99.21,"date":"2024-10-01","meet":"Danvers"},{"id":187,"swimmerId":7,"event":"100y Back","time":81.91,"date":"2024-10-01","meet":"Danvers"},{"id":188,"swimmerId":6,"event":"100y Back","time":72.5,"date":"2024-10-01","meet":"Danvers"},{"id":189,"swimmerId":12,"event":"100y Back","time":94.25,"date":"2024-10-01","meet":"Danvers"},{"id":190,"swimmerId":16,"event":"100y Breast","time":107.22,"date":"2024-10-01","meet":"Danvers"},{"id":191,"swimmerId":14,"event":"500y Free","time":565.39,"date":"2024-10-01","meet":"Marblehead"},{"id":192,"swimmerId":4,"event":"100y Breast","time":81.38,"date":"2024-10-01","meet":"Swampscott"},{"id":193,"swimmerId":14,"event":"100y Breast","time":100.87,"date":"2024-10-01","meet":"Danvers"}],
  events: ["50y Back","50y Breast","50y Fly","50y Free","100y Back","100y Breast","100y Fly","100y Free","200y Free","200y IM","500y Free"],
  cuts: {}
};

function formatTime(s) {
  if (!s && s !== 0) return "—";
  const mins = Math.floor(s / 60);
  const secs = (s % 60).toFixed(2).padStart(5, "0");
  return mins > 0 ? `${mins}:${secs}` : `${secs}s`;
}
function parseTime(str) {
  if (!str) return null;
  const clean = str.trim();
  if (clean.includes(":")) { const [m, s] = clean.split(":").map(Number); return m * 60 + s; }
  return parseFloat(clean) || null;
}
function CutBadge({ cuts, event, time }) {
  const c = cuts?.[event]; if (!c) return null;
  if (c.A && time <= c.A) return <span style={{background:"#FFD700",color:"#1a1a2e",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:1}}>A CUT</span>;
  if (c.B && time <= c.B) return <span style={{background:"#C0C0C0",color:"#1a1a2e",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:1}}>B CUT</span>;
  return null;
}
function ImprovementArrow({ delta }) {
  if (!delta && delta !== 0) return null;
  const improved = delta < 0;
  return <span style={{color:improved?"#00e5a0":"#ff6b6b",fontWeight:700,fontSize:13}}>{improved?"▼":"▲"} {Math.abs(delta).toFixed(2)}s</span>;
}

export default function SwimTracker() {
  const [tab, setTab] = useState("dashboard");
  const [swimmers, setSwimmers] = useState(SEED_DATA.swimmers);
  const [times, setTimes] = useState(SEED_DATA.times);
  const [meets, setMeets] = useState(SEED_DATA.meets);
  const [events, setEvents] = useState(SEED_DATA.events);
  const [cuts, setCuts] = useState(SEED_DATA.cuts);
  const [selectedSwimmer, setSelectedSwimmer] = useState(null);
  const [leaderboardEvent, setLeaderboardEvent] = useState(SEED_DATA.events[3]);

  const [editingMeet, setEditingMeet] = useState(null);
  const [editMeetName, setEditMeetName] = useState("");
  const [editMeetSeason, setEditMeetSeason] = useState("");
  const [collapsedSeasons, setCollapsedSeasons] = useState({});

  const [showAddTime, setShowAddTime] = useState(false);
  const [showAddSwimmer, setShowAddSwimmer] = useState(false);
  const [showAddMeet, setShowAddMeet] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditCut, setShowEditCut] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  const [newTime, setNewTime] = useState({swimmerId:"",event:"",time:"",date:"",meet:""});
  const [newSwimmer, setNewSwimmer] = useState({name:"",age:"",specialty:"Freestyle"});
  const [newMeet, setNewMeet] = useState({name:"",season:""});
  const [newEvent, setNewEvent] = useState("");
  const [editCutA, setEditCutA] = useState("");
  const [editCutB, setEditCutB] = useState("");

  const nextId = arr => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;

  const pbMap = useMemo(() => {
    const map = {};
    times.forEach(t => { const k = `${t.swimmerId}-${t.event}`; if (!map[k] || t.time < map[k]) map[k] = t.time; });
    return map;
  }, [times]);

  const seasons = useMemo(() => [...new Set(meets.map(m => m.season || ""))].sort(), [meets]);
  const meetsBySeason = useMemo(() => {
    const groups = {};
    meets.forEach(m => { const s = m.season||""; if(!groups[s]) groups[s]=[]; groups[s].push(m); });
    return groups;
  }, [meets]);

  const swimmerTimes = sid => times.filter(t => t.swimmerId === sid).sort((a,b) => new Date(b.date)-new Date(a.date));

  const leaderboard = useMemo(() => {
    if (!leaderboardEvent) return [];
    return swimmers.map(sw => {
      const best = times.filter(t => t.swimmerId===sw.id && t.event===leaderboardEvent).sort((a,b)=>a.time-b.time)[0];
      return best ? {swimmer:sw, time:best.time} : null;
    }).filter(Boolean).sort((a,b)=>a.time-b.time);
  }, [swimmers, times, leaderboardEvent]);

  const addTime = () => {
    const parsed = parseTime(newTime.time);
    if (!newTime.swimmerId || !newTime.event || !parsed || !newTime.date) return;
    setTimes(t => [...t, {...newTime, id:nextId(times), swimmerId:Number(newTime.swimmerId), time:parsed}]);
    setNewTime({swimmerId:"",event:"",time:"",date:"",meet:""}); setShowAddTime(false);
  };
  const addSwimmer = () => {
    if (!newSwimmer.name) return;
    setSwimmers(s => [...s, {...newSwimmer, id:nextId(swimmers), age:Number(newSwimmer.age)}]);
    setNewSwimmer({name:"",age:"",specialty:"Freestyle"}); setShowAddSwimmer(false);
  };
  const addMeet = () => {
    const name = newMeet.name.trim();
    if (!name || meets.some(m => m.name === name)) return;
    setMeets(m => [...m, { id: nextId(meets), name, season: newMeet.season.trim() }]);
    setNewMeet({name:"",season:""}); setShowAddMeet(false);
  };
  const saveMeetEdit = () => {
    const newName = editMeetName.trim(); if (!newName) return;
    const oldName = meets.find(m => m.id === editingMeet)?.name;
    setMeets(m => m.map(x => x.id===editingMeet ? {...x, name:newName, season:editMeetSeason.trim()} : x));
    if (oldName !== newName) setTimes(t => t.map(x => x.meet===oldName ? {...x, meet:newName} : x));
    setEditingMeet(null);
  };
  const addEvent = () => {
    const name = newEvent.trim(); if (!name || events.includes(name)) return;
    setEvents(e => [...e, name]); setNewEvent(""); setShowAddEvent(false);
  };
  const removeEvent = ev => {
    setEvents(e => e.filter(x=>x!==ev));
    setCuts(c => { const n={...c}; delete n[ev]; return n; });
    setShowConfirmDelete(null);
    if (leaderboardEvent===ev) setLeaderboardEvent(events.filter(x=>x!==ev)[0]||"");
  };
  const saveCut = evName => {
    const A = parseTime(editCutA), B = parseTime(editCutB);
    setCuts(c => { const n={...c}; if(!A&&!B){delete n[evName];}else{n[evName]={A:A||null,B:B||null};} return n; });
    setShowEditCut(null);
  };
  const removeCut = evName => { setCuts(c=>{const n={...c};delete n[evName];return n;}); setShowConfirmDelete(null); };
  const toggleSeason = s => setCollapsedSeasons(c => ({...c, [s]: !c[s]}));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0d1526} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
    input,select{outline:none} input::placeholder{color:#3a5a7a}
    .meet-row:hover { border-color: #1e4070 !important; }
    .icon-btn:hover { opacity:0.8; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  `;
  const bg="#080d1a",card="#0d1a2e",border="#1a3050",accent="#00b4ff",gold="#FFD700",text="#e0eaf8",muted="#4a7090",danger="#ff4d4d";
  const inputStyle={background:"#0a1520",border:`1px solid ${border}`,borderRadius:8,color:text,padding:"10px 14px",fontSize:14,fontFamily:"Barlow, sans-serif",width:"100%"};
  const inputSmall={...inputStyle,padding:"7px 10px",fontSize:13};
  const btnPrimary={background:`linear-gradient(135deg,${accent},#0077cc)`,border:"none",borderRadius:8,color:"#fff",padding:"10px 22px",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,fontWeight:700,letterSpacing:1,cursor:"pointer",boxShadow:"0 0 20px rgba(0,180,255,0.3)"};
  const btnSecondary={background:"transparent",border:`1px solid ${border}`,borderRadius:8,color:muted,padding:"10px 22px",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,cursor:"pointer"};
  const btnDanger={background:"transparent",border:`1px solid ${danger}44`,borderRadius:8,color:danger,padding:"7px 14px",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,cursor:"pointer"};
  const modalOverlay={position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100};
  const modalBox={background:card,border:`1px solid ${border}`,borderRadius:16,padding:28,width:440,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,0.6)",animation:"fadeIn 0.2s ease"};
  const tabDefs=[{id:"dashboard",label:"Dashboard"},{id:"swimmers",label:"Swimmers"},{id:"meets",label:"Meets"},{id:"leaderboard",label:"Leaderboard"},{id:"cuts",label:"Qualifying Cuts"},{id:"settings",label:"⚙ Settings"}];

  const renderDashboard = () => {
    const totalACuts = Object.entries(pbMap).filter(([k,t])=>{const ev=k.split(/-(.+)/)[1];return cuts[ev]&&cuts[ev].A&&t<=cuts[ev].A}).length;
    const totalBCuts = Object.entries(pbMap).filter(([k,t])=>{const ev=k.split(/-(.+)/)[1];return cuts[ev]&&cuts[ev].B&&t<=cuts[ev].B&&(!cuts[ev].A||t>cuts[ev].A)}).length;
    const recentTimes = [...times].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
    return (
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[{label:"Swimmers",value:swimmers.length,color:accent},{label:"Times Logged",value:times.length,color:"#a78bfa"},{label:"A Cuts",value:totalACuts,color:gold},{label:"B Cuts",value:totalBCuts,color:"#C0C0C0"}].map(stat=>(
            <div key={stat.label} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"20px 24px"}}>
              <div style={{fontSize:36,fontFamily:"Barlow Condensed, sans-serif",fontWeight:900,color:stat.color,lineHeight:1}}>{stat.value}</div>
              <div style={{color:muted,fontSize:13,marginTop:6,textTransform:"uppercase",letterSpacing:0.5}}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:text,letterSpacing:1}}>RECENT TIMES</h3>
              <button style={{...btnPrimary,padding:"7px 16px",fontSize:13}} onClick={()=>setShowAddTime(true)}>+ LOG TIME</button>
            </div>
            {recentTimes.map(t=>{
              const sw=swimmers.find(s=>s.id===t.swimmerId); const isPB=pbMap[`${t.swimmerId}-${t.event}`]===t.time;
              return (<div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                <div><div style={{color:text,fontSize:14,fontWeight:600}}>{sw?.name}</div><div style={{color:muted,fontSize:12}}>{t.event} · {t.meet}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:isPB?gold:text,fontSize:16,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{formatTime(t.time)} {isPB&&<span style={{fontSize:11}}>PB</span>}</div>
                  <CutBadge cuts={cuts} event={t.event} time={t.time}/>
                </div>
              </div>);
            })}
          </div>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:text,letterSpacing:1,marginBottom:18}}>TEAM CUTS STATUS</h3>
            {swimmers.map(sw=>{
              const aCuts=Object.keys(cuts).filter(ev=>{const pb=pbMap[`${sw.id}-${ev}`];return pb&&cuts[ev].A&&pb<=cuts[ev].A}).length;
              const bCuts=Object.keys(cuts).filter(ev=>{const pb=pbMap[`${sw.id}-${ev}`];return pb&&cuts[ev].B&&pb<=cuts[ev].B&&(!cuts[ev].A||pb>cuts[ev].A)}).length;
              return (<div key={sw.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                <div><div style={{color:text,fontSize:14,fontWeight:600}}>{sw.name}</div><div style={{color:muted,fontSize:12}}>{sw.specialty} · Age {sw.age}</div></div>
                <div style={{display:"flex",gap:8}}>
                  {aCuts>0&&<span style={{background:gold,color:"#1a1a2e",padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700}}>{aCuts}×A</span>}
                  {bCuts>0&&<span style={{background:"#C0C0C0",color:"#1a1a2e",padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700}}>{bCuts}×B</span>}
                  {aCuts===0&&bCuts===0&&<span style={{color:muted,fontSize:12}}>No cuts yet</span>}
                </div>
              </div>);
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSwimmers = () => {
    if (selectedSwimmer) {
      const sw=swimmers.find(s=>s.id===selectedSwimmer); const swTimes=swimmerTimes(selectedSwimmer);
      const swEvents=[...new Set(swTimes.map(t=>t.event))];
      return (<div style={{animation:"fadeIn 0.2s ease"}}>
        <button style={{...btnSecondary,marginBottom:20}} onClick={()=>setSelectedSwimmer(null)}>← Back to Roster</button>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:32,fontWeight:900,color:text}}>{sw?.name}</h2>
              <div style={{color:muted,fontSize:14,marginTop:4}}>Age {sw?.age} · Specialty: {sw?.specialty}</div>
            </div>
            <button style={{...btnPrimary,padding:"8px 16px",fontSize:13}} onClick={()=>{setNewTime(t=>({...t,swimmerId:selectedSwimmer}));setShowAddTime(true);}}>+ LOG TIME</button>
          </div>
        </div>
        {swEvents.map(event=>{
          const eventTimes=swTimes.filter(t=>t.event===event).sort((a,b)=>new Date(a.date)-new Date(b.date));
          const pb=Math.min(...eventTimes.map(t=>t.time));
          return (<div key={event} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:20,fontWeight:700,color:text}}>{event}</h3>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{color:muted,fontSize:13}}>PB:</span>
                <span style={{color:gold,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{formatTime(pb)}</span>
                <CutBadge cuts={cuts} event={event} time={pb}/>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60,marginBottom:12}}>
              {eventTimes.map(t=>{
                const maxT=Math.max(...eventTimes.map(x=>x.time)),minT=Math.min(...eventTimes.map(x=>x.time));
                const h=20+((t.time-minT)/((maxT-minT)||1))*40; const isPB=t.time===pb;
                return <div key={t.id} title={`${formatTime(t.time)} – ${t.date} @ ${t.meet}`} style={{flex:1,height:h,background:isPB?gold:`linear-gradient(to top,${accent}66,${accent}22)`,borderRadius:"4px 4px 0 0",border:isPB?`1px solid ${gold}`:`1px solid ${accent}44`}}/>;
              })}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...eventTimes].reverse().slice(0,6).map((t,i,arr)=>{
                const prev=arr[i+1],delta=prev?t.time-prev.time:null;
                return (<div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#0a1520",borderRadius:8}}>
                  <span style={{color:muted,fontSize:13}}>{t.date} · {t.meet}</span>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    {delta!==null&&<ImprovementArrow delta={delta}/>}
                    <span style={{color:t.time===pb?gold:text,fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700}}>{formatTime(t.time)}</span>
                  </div>
                </div>);
              })}
            </div>
          </div>);
        })}
        {swEvents.length===0&&<div style={{color:muted,textAlign:"center",padding:40}}>No times logged yet.</div>}
      </div>);
    }
    return (<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>ROSTER ({swimmers.length})</h2>
        <button style={btnPrimary} onClick={()=>setShowAddSwimmer(true)}>+ ADD SWIMMER</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {swimmers.map(sw=>{
          const swTimes=times.filter(t=>t.swimmerId===sw.id); const pbs=[...new Set(swTimes.map(t=>t.event))].length;
          const swCuts=Object.keys(cuts).filter(ev=>{const pb=pbMap[`${sw.id}-${ev}`];return pb&&((cuts[ev].A&&pb<=cuts[ev].A)||(cuts[ev].B&&pb<=cuts[ev].B))}).length;
          return (<div key={sw.id} onClick={()=>setSelectedSwimmer(sw.id)} style={{background:card,border:`1px solid ${border}`,borderLeft:`3px solid ${accent}`,borderRadius:14,padding:22,cursor:"pointer"}}>
            <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:4}}>{sw.name}</div>
            <div style={{color:muted,fontSize:13,marginBottom:14}}>Age {sw.age} · {sw.specialty}</div>
            <div style={{display:"flex",gap:16}}>
              {[{v:swTimes.length,l:"Times",c:accent},{v:pbs,l:"Events",c:accent},{v:swCuts,l:"Cuts",c:gold}].map(s=>(
                <div key={s.l}><div style={{color:s.c,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{s.v}</div><div style={{color:muted,fontSize:11,textTransform:"uppercase"}}>{s.l}</div></div>
              ))}
            </div>
          </div>);
        })}
      </div>
    </div>);
  };

  const MeetCard = ({ meet }) => {
    const mt=times.filter(t=>t.meet===meet.name);
    const uniq=[...new Set(mt.map(t=>t.swimmerId))].length;
    const pbs=mt.filter(t=>pbMap[`${t.swimmerId}-${t.event}`]===t.time).length;
    const isEditing=editingMeet===meet.id;
    if (isEditing) {
      const allSeasons=[...new Set(meets.map(m=>m.season).filter(Boolean))];
      return (
        <div style={{background:card,border:`2px solid ${accent}55`,borderRadius:14,padding:20,marginBottom:12,animation:"fadeIn 0.15s ease"}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:"2 1 160px"}}>
              <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5}}>Meet Name</label>
              <input style={inputSmall} value={editMeetName} onChange={e=>setEditMeetName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveMeetEdit();if(e.key==="Escape")setEditingMeet(null);}} autoFocus/>
            </div>
            <div style={{flex:"1 1 130px"}}>
              <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5}}>Season</label>
              <input style={inputSmall} list="seasons-list" value={editMeetSeason} placeholder="e.g. 2024-25"
                onChange={e=>setEditMeetSeason(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveMeetEdit();if(e.key==="Escape")setEditingMeet(null);}}/>
              <datalist id="seasons-list">{allSeasons.map(s=><option key={s} value={s}/>)}</datalist>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",marginTop:"auto",paddingTop:20}}>
              <button style={{...btnPrimary,padding:"7px 16px",fontSize:13}} onClick={saveMeetEdit}>Save</button>
              <button style={{...btnSecondary,padding:"7px 14px",fontSize:13}} onClick={()=>setEditingMeet(null)}>Cancel</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="meet-row" style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"18px 22px",marginBottom:12,transition:"border-color 0.2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mt.length>0?14:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:20,fontWeight:800,color:text}}>{meet.name}</h3>
            {meet.season&&<span style={{background:"#0f2040",border:`1px solid ${border}`,color:accent,fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:99,letterSpacing:0.5}}>{meet.season}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{display:"flex",gap:16}}>
              {[{v:uniq,l:"Swimmers",c:accent},{v:mt.length,l:"Swims",c:accent},{v:pbs,l:"PBs",c:gold}].map(s=>(
                <div key={s.l} style={{textAlign:"center"}}>
                  <div style={{color:s.c,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{s.v}</div>
                  <div style={{color:muted,fontSize:10,textTransform:"uppercase"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <button className="icon-btn" title="Edit meet" onClick={()=>{setEditingMeet(meet.id);setEditMeetName(meet.name);setEditMeetSeason(meet.season||"");}}
              style={{background:"transparent",border:`1px solid ${border}`,borderRadius:7,color:muted,width:32,height:32,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
          </div>
        </div>
        {mt.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {mt.slice(0,5).map(t=>{
              const sw=swimmers.find(s=>s.id===t.swimmerId); const isPB=pbMap[`${t.swimmerId}-${t.event}`]===t.time;
              return (<div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#0a1520",borderRadius:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{color:text,fontWeight:600,fontSize:13}}>{sw?.name}</span><span style={{color:muted,fontSize:12}}>{t.event}</span></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {isPB&&<span style={{color:gold,fontSize:10,fontWeight:700}}>PB</span>}
                  <CutBadge cuts={cuts} event={t.event} time={t.time}/>
                  <span style={{color:isPB?gold:text,fontFamily:"Barlow Condensed, sans-serif",fontSize:16,fontWeight:700}}>{formatTime(t.time)}</span>
                </div>
              </div>);
            })}
            {mt.length>5&&<div style={{color:muted,fontSize:12,textAlign:"center",padding:"4px 0"}}>+{mt.length-5} more swims</div>}
          </div>
        )}
      </div>
    );
  };

  const renderMeets = () => {
    const unassigned=meetsBySeason[""||""]||[];
    const namedSeasons=seasons.filter(s=>s!=="");
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>MEETS</h2>
          <div style={{display:"flex",gap:10}}>
            <button style={btnSecondary} onClick={()=>setShowAddMeet(true)}>+ ADD MEET</button>
            <button style={btnPrimary} onClick={()=>setShowAddTime(true)}>+ LOG TIME</button>
          </div>
        </div>
        {namedSeasons.map(season=>{
          const seasonMeets=meetsBySeason[season]||[];
          const collapsed=collapsedSeasons[season];
          const totalSwims=seasonMeets.reduce((acc,m)=>acc+times.filter(t=>t.meet===m.name).length,0);
          return (
            <div key={season} style={{marginBottom:28}}>
              <div onClick={()=>toggleSeason(season)} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:12,userSelect:"none"}}>
                <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:accent}}>{collapsed?"▶":"▼"} {season}</div>
                <div style={{flex:1,height:1,background:border}}/>
                <div style={{color:muted,fontSize:12}}>{seasonMeets.length} meet{seasonMeets.length!==1?"s":""} · {totalSwims} swims</div>
              </div>
              {!collapsed&&seasonMeets.map(m=><MeetCard key={m.id} meet={m}/>)}
            </div>
          );
        })}
        {unassigned.length>0&&(
          <div style={{marginBottom:28}}>
            {namedSeasons.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:muted}}>NO SEASON</div>
                <div style={{flex:1,height:1,background:border}}/>
              </div>
            )}
            {unassigned.map(m=><MeetCard key={m.id} meet={m}/>)}
          </div>
        )}
        {meets.length===0&&<div style={{color:muted,textAlign:"center",padding:60,fontSize:16}}>No meets yet.</div>}
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>LEADERBOARD</h2>
        <select value={leaderboardEvent} onChange={e=>setLeaderboardEvent(e.target.value)} style={{...inputStyle,width:220}}>
          {events.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      {leaderboard.length===0?<div style={{color:muted,textAlign:"center",padding:60,fontSize:16}}>No times logged for this event.</div>
        :leaderboard.map((entry,i)=>(
          <div key={entry.swimmer.id} style={{background:i===0?`linear-gradient(135deg,#2a1f00,#1a1500)`:card,border:`1px solid ${i===0?gold:border}`,borderRadius:14,padding:"18px 24px",display:"flex",alignItems:"center",gap:20,marginBottom:10}}>
            <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:42,fontWeight:900,color:i===0?gold:i===1?"#C0C0C0":i===2?"#CD7F32":muted,width:50,textAlign:"center",lineHeight:1}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>{entry.swimmer.name}</div>
              <div style={{color:muted,fontSize:13}}>Age {entry.swimmer.age} · {entry.swimmer.specialty}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:32,fontWeight:900,color:i===0?gold:text}}>{formatTime(entry.time)}</div>
              <CutBadge cuts={cuts} event={leaderboardEvent} time={entry.time}/>
            </div>
          </div>
        ))}
    </div>
  );

  const renderCuts = () => (
    <div>
      <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text,marginBottom:24}}>QUALIFYING CUTS</h2>
      {Object.keys(cuts).length===0&&<div style={{color:muted,textAlign:"center",padding:60}}>No qualifying cuts set. Add cuts in ⚙ Settings.</div>}
      {Object.entries(cuts).map(([event,c])=>{
        const qualifiers=swimmers.map(sw=>{
          const pb=pbMap[`${sw.id}-${event}`]; if(!pb) return null;
          const level=c.A&&pb<=c.A?"A":c.B&&pb<=c.B?"B":null;
          return level?{swimmer:sw,pb,level}:null;
        }).filter(Boolean).sort((a,b)=>a.pb-b.pb);
        return (<div key={event} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text}}>{event}</h3>
            <div style={{display:"flex",gap:16}}>
              {c.A&&<span style={{color:muted,fontSize:13}}>A: <span style={{color:gold,fontWeight:700}}>{formatTime(c.A)}</span></span>}
              {c.B&&<span style={{color:muted,fontSize:13}}>B: <span style={{color:"#C0C0C0",fontWeight:700}}>{formatTime(c.B)}</span></span>}
            </div>
          </div>
          {qualifiers.length===0?<div style={{color:muted,fontSize:14}}>No swimmers have achieved this cut yet.</div>:(
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {qualifiers.map(q=>(
                <div key={q.swimmer.id} style={{background:"#0a1520",border:`1px solid ${q.level==="A"?gold:"#C0C0C0"}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:text,fontWeight:600,fontSize:14}}>{q.swimmer.name}</span>
                  <span style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:q.level==="A"?gold:"#C0C0C0"}}>{formatTime(q.pb)}</span>
                  <span style={{background:q.level==="A"?gold:"#C0C0C0",color:"#1a1a2e",padding:"1px 8px",borderRadius:99,fontSize:11,fontWeight:700}}>{q.level} CUT</span>
                </div>
              ))}
            </div>
          )}
        </div>);
      })}
    </div>
  );

  const renderSettings = () => (
    <div style={{display:"flex",flexDirection:"column",gap:32}}>
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text}}>EVENTS</h2>
            <p style={{color:muted,fontSize:13,marginTop:4}}>Events available when logging times.</p>
          </div>
          <button style={{...btnPrimary,padding:"8px 18px",fontSize:13}} onClick={()=>setShowAddEvent(true)}>+ ADD EVENT</button>
        </div>
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:6}}>
          {events.map(ev=>{
            const cnt=times.filter(t=>t.event===ev).length; const hasCut=!!cuts[ev];
            return (<div key={ev} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#0a1520",borderRadius:10,gap:12}}>
              <div style={{flex:1}}>
                <span style={{color:text,fontWeight:600,fontSize:15}}>{ev}</span>
                <span style={{color:muted,fontSize:12,marginLeft:12}}>{cnt} time{cnt!==1?"s":""} logged</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {hasCut?<span style={{background:"#1a3050",color:accent,padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:600}}>Has cuts</span>:<span style={{color:"#1a3050",fontSize:12}}>No cuts</span>}
                <button style={{background:"transparent",border:`1px solid ${accent}44`,borderRadius:7,color:accent,padding:"5px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:12,cursor:"pointer"}}
                  onClick={()=>{setShowEditCut(ev);const c=cuts[ev];setEditCutA(c?.A?formatTime(c.A).replace("s",""):"");setEditCutB(c?.B?formatTime(c.B).replace("s",""):"");}}>
                  {hasCut?"Edit Cut":"Set Cut"}
                </button>
                <button style={btnDanger} onClick={()=>setShowConfirmDelete({type:"event",value:ev})}>Remove</button>
              </div>
            </div>);
          })}
        </div>
      </div>
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:4}}>QUALIFYING CUTS</h2>
        <p style={{color:muted,fontSize:13,marginBottom:20}}>A and B standard times.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Object.entries(cuts).map(([ev,c])=>(
            <div key={ev} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#0a1520",borderRadius:10}}>
              <span style={{color:text,fontWeight:600,fontSize:15,flex:1}}>{ev}</span>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                {c.A&&<span style={{color:muted,fontSize:13}}>A: <span style={{color:gold,fontWeight:700,fontFamily:"Barlow Condensed, sans-serif",fontSize:16}}>{formatTime(c.A)}</span></span>}
                {c.B&&<span style={{color:muted,fontSize:13}}>B: <span style={{color:"#C0C0C0",fontWeight:700,fontFamily:"Barlow Condensed, sans-serif",fontSize:16}}>{formatTime(c.B)}</span></span>}
                <button style={{background:"transparent",border:`1px solid ${accent}44`,borderRadius:7,color:accent,padding:"5px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:12,cursor:"pointer"}}
                  onClick={()=>{setShowEditCut(ev);setEditCutA(c?.A?formatTime(c.A).replace("s",""):"");setEditCutB(c?.B?formatTime(c.B).replace("s",""):"");}}>Edit</button>
                <button style={btnDanger} onClick={()=>setShowConfirmDelete({type:"cut",value:ev})}>Remove</button>
              </div>
            </div>
          ))}
          {Object.keys(cuts).length===0&&<div style={{color:muted,fontSize:14,textAlign:"center",padding:24}}>No qualifying cuts set. Use "Set Cut" on any event above.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <><style>{css}</style>
    <div style={{background:bg,minHeight:"100vh",fontFamily:"Barlow, sans-serif",color:text}}>
      <div style={{background:`linear-gradient(180deg,#0a1830 0%,${bg} 100%)`,borderBottom:`1px solid ${border}`,padding:"0 24px"}}>
        <div style={{maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{padding:"14px 0"}}>
            <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:900,color:text,letterSpacing:2,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:accent}}>⬡</span> AQUA TRACKER
            </div>
            <div style={{color:muted,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Peabody Swim Team</div>
          </div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {tabDefs.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setSelectedSwimmer(null);setEditingMeet(null);}}
                style={{background:tab===t.id?`linear-gradient(135deg,${accent}22,${accent}11)`:"transparent",border:tab===t.id?`1px solid ${accent}66`:"1px solid transparent",color:tab===t.id?accent:muted,padding:"8px 12px",borderRadius:8,fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:1,cursor:"pointer"}}>
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"24px"}}>
        {tab==="dashboard"&&renderDashboard()}
        {tab==="swimmers"&&renderSwimmers()}
        {tab==="meets"&&renderMeets()}
        {tab==="leaderboard"&&renderLeaderboard()}
        {tab==="cuts"&&renderCuts()}
        {tab==="settings"&&renderSettings()}
      </div>

      {showAddTime&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowAddTime(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>LOG TIME</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <select style={inputStyle} value={newTime.swimmerId} onChange={e=>setNewTime(t=>({...t,swimmerId:e.target.value}))}>
              <option value="">Select Swimmer</option>
              {swimmers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select style={inputStyle} value={newTime.event} onChange={e=>setNewTime(t=>({...t,event:e.target.value}))}>
              <option value="">Select Event</option>
              {events.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
            <input style={inputStyle} placeholder="Time (e.g. 56.23 or 1:02.45)" value={newTime.time} onChange={e=>setNewTime(t=>({...t,time:e.target.value}))}/>
            <input style={inputStyle} type="date" value={newTime.date} onChange={e=>setNewTime(t=>({...t,date:e.target.value}))}/>
            <select style={inputStyle} value={newTime.meet} onChange={e=>setNewTime(t=>({...t,meet:e.target.value}))}>
              <option value="">Select Meet</option>
              {seasons.filter(s=>s!=="").map(s=>(
                <optgroup key={s} label={s}>
                  {(meetsBySeason[s]||[]).map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </optgroup>
              ))}
              {(meetsBySeason[""]||[]).length>0&&(
                <optgroup label="No Season">
                  {(meetsBySeason[""]||[]).map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </optgroup>
              )}
            </select>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addTime}>Save Time</button>
              <button style={btnSecondary} onClick={()=>setShowAddTime(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddSwimmer&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowAddSwimmer(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>ADD SWIMMER</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inputStyle} placeholder="Full Name" value={newSwimmer.name} onChange={e=>setNewSwimmer(s=>({...s,name:e.target.value}))}/>
            <input style={inputStyle} placeholder="Age" type="number" value={newSwimmer.age} onChange={e=>setNewSwimmer(s=>({...s,age:e.target.value}))}/>
            <select style={inputStyle} value={newSwimmer.specialty} onChange={e=>setNewSwimmer(s=>({...s,specialty:e.target.value}))}>
              {["Freestyle","Backstroke","Breaststroke","Butterfly","IM"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addSwimmer}>Add Swimmer</button>
              <button style={btnSecondary} onClick={()=>setShowAddSwimmer(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddMeet&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowAddMeet(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>ADD MEET</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{color:muted,fontSize:12,display:"block",marginBottom:6}}>Meet Name</label>
              <input style={inputStyle} placeholder="e.g. Gloucester" value={newMeet.name} onChange={e=>setNewMeet(m=>({...m,name:e.target.value}))}/>
            </div>
            <div>
              <label style={{color:muted,fontSize:12,display:"block",marginBottom:6}}>Season <span style={{color:"#2a4060"}}>(optional)</span></label>
              <input style={inputStyle} list="add-seasons-list" placeholder="e.g. 2024-25" value={newMeet.season} onChange={e=>setNewMeet(m=>({...m,season:e.target.value}))}/>
              <datalist id="add-seasons-list">{[...new Set(meets.map(m=>m.season).filter(Boolean))].map(s=><option key={s} value={s}/>)}</datalist>
              <div style={{color:muted,fontSize:12,marginTop:5}}>Meets with the same season label are grouped together.</div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addMeet}>Add Meet</button>
              <button style={btnSecondary} onClick={()=>setShowAddMeet(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddEvent&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowAddEvent(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:8}}>ADD EVENT</h3>
          <p style={{color:muted,fontSize:13,marginBottom:20}}>e.g. "200y Backstroke" or "4x100y Relay"</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inputStyle} placeholder="Event name" value={newEvent} onChange={e=>setNewEvent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEvent()}/>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addEvent}>Add Event</button>
              <button style={btnSecondary} onClick={()=>{setShowAddEvent(false);setNewEvent("");}}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showEditCut&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowEditCut(null)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:4}}>SET QUALIFYING CUTS</h3>
          <p style={{color:accent,fontSize:14,fontWeight:600,marginBottom:4}}>{showEditCut}</p>
          <p style={{color:muted,fontSize:13,marginBottom:20}}>Enter as seconds (56.23) or min:sec (1:02.45). Leave blank to remove that level.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{color:gold,fontSize:13,fontWeight:700,letterSpacing:1,display:"block",marginBottom:6}}>A STANDARD</label>
              <input style={inputStyle} placeholder="e.g. 57.50 or 1:02.45" value={editCutA} onChange={e=>setEditCutA(e.target.value)}/>
            </div>
            <div>
              <label style={{color:"#C0C0C0",fontSize:13,fontWeight:700,letterSpacing:1,display:"block",marginBottom:6}}>B STANDARD</label>
              <input style={inputStyle} placeholder="e.g. 62.00 or 1:08.00" value={editCutB} onChange={e=>setEditCutB(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={()=>saveCut(showEditCut)}>Save Cuts</button>
              <button style={btnSecondary} onClick={()=>setShowEditCut(null)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showConfirmDelete&&(<div style={modalOverlay} onClick={e=>e.target===e.currentTarget&&setShowConfirmDelete(null)}>
        <div style={{...modalBox,width:380}}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:12}}>
            {showConfirmDelete.type==="event"?"REMOVE EVENT?":"REMOVE CUT?"}
          </h3>
          <p style={{color:muted,fontSize:14,lineHeight:1.6,marginBottom:24}}>
            {showConfirmDelete.type==="event"
              ?<>Removing <span style={{color:text,fontWeight:600}}>"{showConfirmDelete.value}"</span> hides it from the event picker. Logged times won't be deleted, but its cuts will be removed.</>
              :<>Remove qualifying cuts for <span style={{color:text,fontWeight:600}}>"{showConfirmDelete.value}"</span>? Logged times are unaffected.</>}
          </p>
          <div style={{display:"flex",gap:10}}>
            <button style={{...btnPrimary,background:`linear-gradient(135deg,${danger},#cc0000)`,boxShadow:"none"}}
              onClick={()=>showConfirmDelete.type==="event"?removeEvent(showConfirmDelete.value):removeCut(showConfirmDelete.value)}>
              Yes, Remove
            </button>
            <button style={btnSecondary} onClick={()=>setShowConfirmDelete(null)}>Cancel</button>
          </div>
        </div>
      </div>)}
    </div></>
  );
}
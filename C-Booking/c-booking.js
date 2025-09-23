const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    signUpButton.addEventListener('click', () => { container.classList.add("right-panel-active"); });
    signInButton.addEventListener('click', () => { container.classList.remove("right-panel-active"); });

    const themeSwitcher = document.getElementById("themeSwitcher");
    themeSwitcher.addEventListener("change", () => {
      document.body.classList.toggle("dark", themeSwitcher.checked);
    });

    const bookBtn = document.getElementById("bookSessionBtn");
    bookBtn.addEventListener("click", () => {
      const name = encodeURIComponent(document.getElementById("fullName").value || "MindCare Session");
      const dtInput = document.getElementById("bookingDateTime").value;
      if(!dtInput){ alert("Please select date & time"); return; }
      const dt = new Date(dtInput);
      const start = dt.toISOString().replace(/[-:]|\.000/g,"");
      const endDt = new Date(dt.getTime() + 60*60*1000); // 1 hour session
      const end = endDt.toISOString().replace(/[-:]|\.000/g,"");

      // Google Calendar
      document.getElementById("googleLink").href = 
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${name}&details=Confidential+session+with+MindCare&dates=${start}/${end}`;

      // Outlook
      document.getElementById("outlookLink").href = 
        `https://outlook.live.com/calendar/0/deeplink/compose?subject=${name}&body=Confidential+session+with+MindCare&startdt=${dt.toISOString()}&enddt=${endDt.toISOString()}`;

      // Apple Calendar
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${name}
DESCRIPTION:Confidential session with MindCare
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`;
      const blob = new Blob([icsContent], {type: 'text/calendar'});
      const url = URL.createObjectURL(blob);
      document.getElementById("appleLink").href = url;

      alert("Calendar links updated! Click the buttons to book.");
    });
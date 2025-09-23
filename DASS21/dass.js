const themeSwitcher = document.getElementById("themeSwitcher");
        themeSwitcher.addEventListener("change", () => {
            document.body.classList.toggle("dark");
            document.body.classList.toggle("light");
        });

        // === DASS-21 QUESTIONS (JS equivalent) ===
        const DASS21_QUESTIONS = {
            "Depression": [
                "I couldn't seem to experience any positive feeling at all",
                "I felt that I had nothing to look forward to",
                "I felt down-hearted and blue",
                "I felt I wasn't worth much as a person",
                "I felt that I was unable to become enthusiastic about anything",
                "I felt that life was meaningless",
                "I felt that I had nothing to look forward to"
            ],
            "Anxiety": [
                "I experienced breathing difficulty (e.g., rapid breathing, breathlessness)",
                "I felt scared without any good reason",
                "I felt that I was close to panic",
                "I was aware of the action of my heart in the absence of physical exertion",
                "I felt I was using a lot of nervous energy",
                "I felt restless or agitated",
                "I experienced trembling (e.g., in the hands)"
            ],
            "Stress": [
                "I found it hard to wind down",
                "I tended to over-react to situations",
                "I felt that I was using a lot of nervous energy",
                "I found myself getting agitated",
                "I found it difficult to relax",
                "I was intolerant of anything that kept me from getting on with what I was doing",
                "I experienced difficulty in concentrating on tasks"
            ]
        };

        // === SCORING AND INTERPRETATION (JS equivalent) ===
        function calculateScore(answers) {
            let sum = answers.reduce((acc, curr) => acc + curr, 0);
            return sum * 2;
        }

        function interpretScore(subscale, score) {
            if (subscale === "Depression") {
                if (score >= 0 && score <= 9) return "Normal";
                if (score >= 10 && score <= 13) return "Mild";
                if (score >= 14 && score <= 20) return "Moderate";
                if (score >= 21 && score <= 27) return "Severe";
                if (score >= 28) return "Extremely Severe";
            } else if (subscale === "Anxiety") {
                if (score >= 0 && score <= 7) return "Normal";
                if (score >= 8 && score <= 9) return "Mild";
                if (score >= 10 && score <= 14) return "Moderate";
                if (score >= 15 && score <= 19) return "Severe";
                if (score >= 20) return "Extremely Severe";
            } else if (subscale === "Stress") {
                if (score >= 0 && score <= 14) return "Normal";
                if (score >= 15 && score <= 18) return "Mild";
                if (score >= 19 && score <= 25) return "Moderate";
                if (score >= 26 && score <= 33) return "Severe";
                if (score >= 34) return "Extremely Severe";
            }
            return "Invalid score";
        }

        // Dynamically generate the form
        const form = document.getElementById("dassForm");
        for (const [subscale, questions] of Object.entries(DASS21_QUESTIONS)) {
            const card = document.createElement("div");
            card.classList.add("subscale-card", subscale);

            card.innerHTML = `<h3>${subscale}</h3>`;
            questions.forEach((q,i) => {
                const qDiv = document.createElement("div");
                qDiv.classList.add("question");
                qDiv.innerHTML = `<p>${i+1}. ${q}</p>`;
                const optDiv = document.createElement("div");
                optDiv.classList.add("options");
                for (let val=0; val<=3; val++) {
                    optDiv.innerHTML += `<label><input type="radio" name="${subscale}-${i}" value="${val}" required> ${val}</label>`;
                }
                qDiv.appendChild(optDiv);
                card.appendChild(qDiv);
            });
            form.appendChild(card);
        }

        // Handle form submission
        form.addEventListener("submit", e => {
            e.preventDefault();
            const answers = {};
            for (const subscale of Object.keys(DASS21_QUESTIONS)) {
                answers[subscale] = [];
                document.querySelectorAll(`input[name^="${subscale}-"]:checked`).forEach(input => {
                    answers[subscale].push(parseInt(input.value));
                });
            }

            const resultDiv = document.getElementById("result");
            resultDiv.style.display = "block";
            resultDiv.innerHTML = "<h3>Your DASS-21 Results</h3>";

            for (const [subscale, subAnswers] of Object.entries(answers)) {
                const score = calculateScore(subAnswers);
                const interpretation = interpretScore(subscale, score);
                resultDiv.innerHTML += `<p><strong>${subscale}:</strong> Score = ${score} (${interpretation})</p>`;
            }
        });
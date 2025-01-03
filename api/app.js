const OpenAI = require("openai");
const express = require('express')
const app = express()
const port = 3000
const openai = new OpenAI({
  apiKey: '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',
});
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Say this is a test",
        },
    ],
    });
    res.send(completion.choices[0].message.content);
  } catch (error) {
    res.status(500).send('Error communicating with OpenAI API');
    console.log(error);
  }
})

app.post('/summary-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        const filePath = req.file.path;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "jestes wykladowca na ciezkiej uczelni wybierz najwazniejsze tematy na podstawie tego pdf. Na kazdy z tych tematow zrob szczegolowe streszczenie z najbardziej istotnymi informacjami" },
                  {
                    type: "file_url",
                    file_url: {
                      "url": filePath,
                    },
                  },
                ],
              },
            ],
          });
          res.send(response.choices[0].message.content);
    } catch (error) {
        res.status(500).send('Error communicating with OpenAI API');
        console.log(error);
    }
})

app.post('/fiszka/', async (req, res) => {
    const summary = req.body;
    console.log(summary);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "developer", content: "Jesteś wykładowcą, który wybiera najważniejsze informacje z całego materiału, wraz z przykładami ułatwiającymi zrozumienie. Napisz podsumowanie każdego tematu w formie fiszek edukacyjnych. Jeśli pominiesz jakiś temat, świat się skończy, a Ty wraz z nim. Fiszki muszą zawierać dokładnie każdą istotną informację oraz co najmniej 8 przykładów na fiszkę. Każdy przykład musi być dokładnie opisany, wskazując za co odpowiada każde ważne słowo. Dodaj numerację, która będzie później przekształcona jako quiz. W podsumowaniu musi się znaleźć absolutnie wszystko w skróconej." },
            {
                role: "user",
                content: "To moje podsumowanie: " + summary,
            },
        ],
      });
      res.send(completion.choices[0].message.content);
    } catch (error) {
      res.status(500).send('Error communicating with OpenAI API');
    }
  })

app.post('/quiz', async (req, res) => {
  const summary = req.body.summary;
  console.log(summary);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "developer", content: "Jesteś wykładowcą, który wybiera najważniejsze informacje z całego materiału. Odpowiedź musi być zawsze prawdziwa i zawsze tylko jedna odpowiedź musi być prawdziwa. Wiadomość musi być zawsze w formacie json." },
          {
              role: "user",
              content: "Na podstawie mojego podsumowania ułóż quiz na podstawie najważniejszych informacji. Quiz zapisz w formie tablicy obiektów json. Przykładowe pytanie w Quiz powinno wyglądać następująco, gdzie pierwsza odpowiedz jest prawdziwa a pozostałe są fałszywe" + "___" + "{'question': 'Ile to jest 2+2', 'answers': ['4', '3', '2', '1']}" + "____" + "To moje podsumowanie: " + summary,
          },
      ],
    });
    res.send(completion.choices[0].message.content);
  } catch (error) {
    res.status(500).send('Error communicating with OpenAI API');
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
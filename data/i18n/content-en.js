/**
 * data/i18n/content-en.js — Educational content in English (mechanisms + general information + glossary).
 * Static dictionary (no runtime machine translation). Overlaid on the Spanish originals by js/components/content.js.
 * Games and quizzes are NOT translated: they stay in Spanish by design.
 */
RCI18n.registerContent("en", {
  mecanismos: {
    "tutela": {
      nombre: "Tutela Action",
      descripcionCorta: "Immediately protects fundamental rights when they are violated or threatened.",
      resumenCarta: "A judicial mechanism designed to protect fundamental rights when they are violated or threatened, in accordance with constitutional and legal requirements.",
      ideaClave: "Protection of rights",
      queEs: "It is a judicial mechanism of immediate protection that anyone can turn to when they believe one of their fundamental rights is being violated or threatened by the action or omission of a public authority, and in some cases of private parties.",
      paraQueSirve: "It is used to ask a judge to order, quickly, the effective protection of a fundamental right (such as life, health, equality or due process) when there is no other equally effective means of defence, or when it is used as a temporary measure to prevent irreparable harm.",
      quienPuedeUsarlo: "Anyone, directly or through a representative, without needing to be a lawyer. It can also be filed by the Ombudsman or municipal ombudsmen (personeros) on behalf of another person.",
      caracteristicas: [
        "It is a priority, summary procedure: the judge must decide within a short period.",
        "It can be filed before any judge of the place where the violation occurred.",
        "It requires no lawyer or special formalities; it can even be handwritten.",
        "The ruling may later be reviewed by the Constitutional Court.",
        "It is subsidiary: it applies when there is no other judicial remedy, unless it is used to prevent irreparable harm."
      ],
      ejemplo: "A health insurer (EPS) refuses to authorise an urgent medical treatment ordered by a specialist; the patient files a tutela and the judge orders the insurer to authorise the procedure within a strict deadline.",
      datoHistorico: "It was created by the 1991 Constitution and regulated by Decree 2591 of 1991. It quickly became one of the mechanisms Colombians use most to defend their rights.",
      constitucion91: "It is enshrined in Article 86 of the Political Constitution of Colombia.",
      datosImportantes: [
        "The general deadline for the judge to decide is 10 business days.",
        "The ruling must be complied with immediately, even if it has been appealed.",
        "It does not apply to claim economic, social or cultural rights on their own, unless they are directly connected to a fundamental right."
      ]
    },
    "derecho-peticion": {
      nombre: "Right of Petition",
      descripcionCorta: "Allows you to request information or ask the authorities to resolve a matter.",
      resumenCarta: "A fundamental right that allows respectful petitions to be submitted to the authorities and a response to be obtained in accordance with legal rules.",
      ideaClave: "Requesting answers",
      queEs: "It is the fundamental right of every person to submit respectful requests to the authorities, and in certain cases to private organisations, and to obtain a prompt and substantive response.",
      paraQueSirve: "It is used to ask for information, request copies of documents, file complaints or claims, or ask an authority to step in on a specific situation.",
      quienPuedeUsarlo: "Anyone, whether an individual or a legal entity, with no need for a lawyer or to justify a special interest in most cases.",
      caracteristicas: [
        "It can be submitted verbally or in writing, including by electronic means.",
        "It requires no formal wording or legal knowledge.",
        "The authority must give a substantive answer; merely acknowledging receipt is not enough.",
        "If there is no answer or it is incomplete, it can be protected through a tutela action."
      ],
      ejemplo: "A citizen asks the mayor's office in writing for information on the status of a paving project in their neighbourhood, and the entity must reply within the legal deadline.",
      datoHistorico: "The right of petition existed before 1991, but the Constitution raised it to a fundamental right and Law 1755 of 2015 updated its general regulation.",
      constitucion91: "It is enshrined in Article 23 of the Political Constitution of Colombia.",
      datosImportantes: [
        "The general response deadline is 15 business days, except for special deadlines depending on the type of request.",
        "For requests for information or documents, the deadline may differ according to the law.",
        "Failing to respond on time can be a disciplinary offence for the official."
      ]
    },
    "referendo": {
      nombre: "Referendum",
      descripcionCorta: "Calls on the people to approve or reject a draft rule or an existing rule.",
      resumenCarta: "A mechanism through which the people can approve or reject regulatory proposals, or decide on repealing a rule, depending on the type.",
      ideaClave: "Deciding on rules",
      queEs: "It is the call made to the people to approve or reject a draft legal rule (approving referendum) or to repeal, wholly or partly, a rule already in force (repealing referendum).",
      paraQueSirve: "It lets citizens decide directly, by voting, whether a rule should come into force, stay in force or cease to exist.",
      quienPuedeUsarlo: "It can be proposed by citizens, through a popular initiative backed by the signatures required by law, by the Government or by Congress, depending on the type of referendum.",
      caracteristicas: [
        "It can be national, departmental, municipal, district or local.",
        "Participation thresholds must be met for the result to be valid.",
        "There are constitutional referendums (to reform the Constitution) and statutory ones.",
        "The vote is secret and takes place on an election day."
      ],
      ejemplo: "A group of citizens collects signatures to propose a referendum seeking to repeal a specific law they consider contrary to the general interest.",
      datoHistorico: "The mechanism was developed in detail by Law 134 of 1994 and later adjusted by Statutory Law 1757 of 2015, which updated several citizen participation rules.",
      constitucion91: "Provided for in Articles 103 and 170 of the Political Constitution of Colombia, among others.",
      datosImportantes: [
        "A repealing referendum on a law requires the signatures of a number of citizens equal to 10% of the electoral roll.",
        "For the result to be valid, a minimum participation threshold is usually required.",
        "It differs from a plebiscite because a referendum concerns a specific rule, not a policy of the Executive."
      ]
    },
    "plebiscito": {
      nombre: "Plebiscite",
      descripcionCorta: "The President consults the people on a momentous national policy decision.",
      resumenCarta: "A mechanism through which the people give their opinion on a political decision of the Government, in accordance with the Constitution and the law.",
      ideaClave: "Political decision",
      queEs: "It is the mechanism by which the President of the Republic calls on the people to back or reject a decision of national importance that it falls to the Executive to take.",
      paraQueSirve: "It is used to legitimise, through a direct popular vote, an important political decision that the Government considers it necessary to submit to the people.",
      quienPuedeUsarlo: "The call belongs exclusively to the President of the Republic, with the signature of all the ministers, after informing Congress beforehand.",
      caracteristicas: [
        "It is national in scope.",
        "Congress can reject the call if it considers that it does not meet the legal requirements.",
        "Its result binds the Government when the required participation thresholds are met.",
        "It cannot be used to amend the Constitution or to reform specific laws."
      ],
      ejemplo: "In 2016 the Colombian Government called a plebiscite for citizens to back or reject the final agreement to end the armed conflict.",
      datoHistorico: "The 2016 plebiscite on the Peace Agreement is the best-known example of this mechanism in Colombia's recent history.",
      constitucion91: "It is regulated by Article 103 of the Political Constitution of Colombia and developed by Law 134 of 1994.",
      datosImportantes: [
        "It requires a minimum participation threshold to be valid.",
        "The President cannot call plebiscites on states of exception or on matters the law expressly excludes.",
        "It differs from a referendum because it is not about a legal text but about a political decision."
      ]
    },
    "consulta-popular": {
      nombre: "Popular Consultation",
      descripcionCorta: "The people answer a general question on a matter of importance.",
      resumenCarta: "A mechanism through which a question on a matter of significance is put to the people, according to the corresponding scope and procedure.",
      ideaClave: "Citizen opinion",
      queEs: "It is the general question put to the people, at the national, departmental, municipal, district or local level, so that they formally give their view on it.",
      paraQueSirve: "It lets the authorities (national or local) learn directly what citizens want on a significant matter before making a decision.",
      quienPuedeUsarlo: "It can be called by the President, governors or mayors, depending on the territorial level, with prior favourable opinion of the corresponding body (Senate, assembly or council), or promoted by citizen initiative.",
      caracteristicas: [
        "The question must be worded clearly so it can be answered yes or no.",
        "It can be called at the national or local level.",
        "It requires the prior opinion of the corresponding public body when called by the officeholder.",
        "The result is binding if the participation threshold required by law is reached."
      ],
      ejemplo: "A municipality calls a popular consultation to ask its residents whether they agree with a certain project of major environmental impact in their territory.",
      datoHistorico: "It has been used in several Colombian municipalities to consult citizens on projects with a high environmental or territorial impact.",
      constitucion91: "It is provided for in Article 103 of the Political Constitution of Colombia and developed by Law 134 of 1994 and Law 1757 of 2015.",
      datosImportantes: [
        "The result is binding when at least one third of the electoral roll takes part and the majority of valid votes go the same way, under the regulation in force.",
        "The authorities must adopt the measures needed to give effect to the popular decision.",
        "It differs from a referendum in that it is not about a legal text but about a general question."
      ]
    },
    "cabildo-abierto": {
      nombre: "Open Town Council (Cabildo Abierto)",
      descripcionCorta: "A public meeting of councils or boards in which the community takes part directly.",
      resumenCarta: "A public space for participation in which citizens can speak up to discuss matters of community interest before the corresponding bodies.",
      ideaClave: "Community debate",
      queEs: "It is the public meeting of district or municipal councils or local administrative boards, in which residents can take part directly to discuss matters of interest to the community.",
      paraQueSirve: "It lets the residents of a municipality, district, locality, commune or rural district present proposals and state their needs directly to the corresponding public body.",
      quienPuedeUsarlo: "It can be requested by a number of citizens set by law, depending on the population of the territorial entity.",
      caracteristicas: [
        "It is held at least once per council session period, as provided by law.",
        "Anyone who registers can speak, although without a vote on the body's decisions.",
        "The authorities called must reply in writing to the concerns raised.",
        "It can deal with budget, public works, security, health, education and other local matters."
      ],
      ejemplo: "Residents of a neighbourhood ask the municipal council for an open town council meeting to explain the urgent need to improve public lighting in their area.",
      datoHistorico: "Although the cabildo has roots in the Spanish-American colonial tradition, the cabildo abierto as a modern participation mechanism was developed by Law 134 of 1994.",
      constitucion91: "It is provided for in Article 103 of the Political Constitution of Colombia.",
      datosImportantes: [
        "It is not decision-making in itself: the public body keeps the power to decide.",
        "Spokespersons must register beforehand with the body's secretariat.",
        "It is one of the most used mechanisms at the local level because it is easily accessible to the community."
      ]
    },
    "iniciativa-popular": {
      nombre: "Popular Legislative and Regulatory Initiative",
      descripcionCorta: "Allows citizens to submit draft laws or rules to public bodies.",
      resumenCarta: "A political right that allows a group of citizens to submit regulatory proposals to be debated by the competent public body.",
      ideaClave: "Citizen proposal",
      queEs: "It is the political right of a group of citizens to submit a draft legislative act, law, ordinance, agreement or local resolution to the corresponding public body, so that it processes it and decides on it.",
      paraQueSirve: "It lets organised citizens propose regulatory changes directly, without depending solely on the initiative of members of Congress, departmental deputies or councillors.",
      quienPuedeUsarlo: "A group of citizens that gathers the number of signatures required by law, depending on the scope (national, departmental, municipal, district or local).",
      caracteristicas: [
        "The draft must be processed by the corresponding public body.",
        "It requires the backing of signatures equal to a percentage of the respective electoral roll.",
        "The spokespersons of the initiative may take part in the debate on the draft.",
        "It can concern constitutional reforms, laws, ordinances or agreements, depending on the level."
      ],
      ejemplo: "A group of citizens collects signatures to submit to Congress a bill on a social issue they believe has not been addressed.",
      datoHistorico: "It was first regulated by Law 134 of 1994 and updated by Law 1757 of 2015, which adjusted the signature requirements and procedures.",
      constitucion91: "It is provided for in Articles 103 and 155 of the Political Constitution of Colombia.",
      datosImportantes: [
        "For bills before Congress, the backing of a number of signatures equal to a percentage of the current electoral roll is required.",
        "The public body is not obliged to approve the draft, but it is obliged to process it.",
        "It differs from a referendum because it seeks to create or change a rule from its origin, not to approve or repeal an existing one."
      ]
    },
    "revocatoria-mandato": {
      nombre: "Recall of Mandate",
      descripcionCorta: "Allows citizens to end the mandate of a governor or mayor.",
      resumenCarta: "A mechanism through which citizens can promote, meeting the legal requirements, the early termination of the mandate of certain popularly elected officials.",
      ideaClave: "Political oversight",
      queEs: "It is the mechanism by which citizens end the mandate given to a governor or a mayor before the period for which they were elected is over.",
      paraQueSirve: "It lets citizens exercise direct political oversight over their territorial officeholders when they consider that they are not fulfilling their government programme or are performing unsatisfactorily.",
      quienPuedeUsarlo: "The citizens who make up the respective electoral roll of the department, district or municipality, by collecting signatures in the percentage required by law.",
      caracteristicas: [
        "It only applies to governors and mayors elected by popular vote.",
        "A minimum part of the mandate must have passed before it can be requested.",
        "It is voted on an election day and requires a minimum participation threshold and a minimum number of votes in favour.",
        "If it succeeds, new elections are called to complete the term."
      ],
      ejemplo: "A group of citizens in a municipality collects signatures to request the recall of the mayor, alleging failure to deliver the government programme on which they were elected.",
      datoHistorico: "It was originally regulated by Law 134 of 1994 and substantially modified by Law 1757 of 2015, which removed the requirement to invoke a specific ground.",
      constitucion91: "It is enshrined in Articles 40 and 103 of the Political Constitution of Colombia.",
      datosImportantes: [
        "Since Law 1757 of 2015 it is no longer necessary to invoke a specific ground to request it.",
        "The vote threshold required for it to succeed has been the subject of several legal reforms.",
        "It differs from removal from office, which is a disciplinary sanction imposed by an authority, not a citizen participation mechanism."
      ]
    }
  },

  general: {
    queEs: "Citizen participation mechanisms are instruments established by the Political Constitution of Colombia that allow citizens to take part in public decisions, oversee those who govern and protect their rights. Participation is not limited to voting in elections: it also includes institutional mechanisms, social organisations, community spaces and ways of engaging with the authorities. Their aim is to strengthen democracy and enable everyone to take an active part in the country's political life.",
    importancia: [
      { texto: "They let citizens take part in important decisions." },
      { texto: "They help protect fundamental rights." },
      { texto: "They strengthen democracy beyond elections." },
      { texto: "They promote transparency and oversight of the use of public resources." },
      { texto: "They make it possible to monitor how public officials perform." }
    ],
    importanciaRapida: [{ texto: "Participation" }, { texto: "Rights" }, { texto: "Democracy" }, { texto: "Citizenship" }],
    marcoLegal: [
      { titulo: "Political Constitution", texto: "It strengthens the participatory democracy model. Article 40 recognises the right to take part in the formation, exercise and oversight of political power; Article 103 lists the mechanisms of participation of the people." },
      { titulo: "Law 134 of 1994", texto: "One of the first statutory laws devoted to developing the participation mechanisms provided for by the Constitution: popular initiative, referendum, popular consultation, recall of mandate, plebiscite and open town council." },
      { titulo: "Law 1755 of 2015", texto: "It regulates the fundamental right of petition: how to submit it, what can be requested and within what deadlines the authority must respond." },
      { titulo: "Law 1757 of 2015", texto: "It updates and develops the rules of the six participation mechanisms it directly regulates, and also includes provisions on accountability and citizen oversight committees." }
    ],
    diferencias: [
      { paraQueSirve: "Protect fundamental rights.", votacion: "It is not a popular vote." },
      { paraQueSirve: "Request information or answers.", votacion: "No." },
      { paraQueSirve: "Decide on certain rules.", votacion: "Yes, when applicable." },
      { paraQueSirve: "Give an opinion on a political decision of the Government.", votacion: "Yes." },
      { paraQueSirve: "Answer a question of public significance.", votacion: "Yes." },
      { paraQueSirve: "Talk publicly about community matters.", votacion: "No, not as a general popular voting mechanism." },
      { paraQueSirve: "Submit regulatory proposals.", votacion: "Not necessarily; it starts a procedure." },
      { paraQueSirve: "Decide whether an officeholder continues.", votacion: "Yes." }
    ],
    derechosQueProtegen: ["Education", "Health", "Equality", "Life", "Freedom", "Citizen participation", "Due process", "A healthy environment"],
    quienesPuedenUsarlos: "In general, all Colombian citizens can use these mechanisms, although some have specific requirements (such as collecting signatures, meeting participation thresholds or belonging to the electoral roll of the corresponding territory).",
    notaImportante: "Although this project studies them together because they relate to participation and the relationship between citizens and the State, legally not all 8 topics belong to the same category. The 6 mechanisms directly regulated by Law 1757 of 2015 are: popular and regulatory initiative, referendum, popular consultation, recall of mandate, plebiscite and open town council. The tutela action and the right of petition are constitutional rights/tools taught alongside them because of their link to participation, but they are not part of those 6 mechanisms of Law 1757.",
    erroresFrecuentes: [
      "Confusing the plebiscite with the referendum.",
      "Thinking that all mechanisms work through a vote.",
      "Claiming that the tutela and the right of petition are mechanisms of Law 1757 of 2015.",
      "Confusing a petition with a regulatory popular initiative.",
      "Thinking that a popular initiative automatically becomes law.",
      "Assuming that any official can be subject to recall, without checking the applicable offices and requirements.",
      "Learning only definitions without understanding what each tool is for."
    ],
    participacionResponsable: [
      "Get informed before making a decision.",
      "Consult reliable sources and tell information apart from opinions or rumours.",
      "Know the right mechanism for each situation.",
      "Respect different opinions.",
      "Support proposals with reasons and evidence.",
      "Take part without resorting to violence or intimidation.",
      "Know the legal requirements and procedures of each formal mechanism.",
      "Follow up on decisions and demand transparency."
    ],
    casosPracticos: [
      { situacion: "A community needs information about a project of a public entity." },
      { situacion: "A person believes a fundamental right is being violated and seeks judicial protection." },
      { situacion: "A group of citizens wants to submit a proposed rule to the competent body." },
      { situacion: "A rule or regulatory proposal is put to a popular decision." },
      { situacion: "The Government submits a political decision of special importance to the people." },
      { situacion: "A question on a matter of significance is put to the citizens." },
      { situacion: "Residents of a territory want to discuss a matter publicly before the corresponding body." },
      { situacion: "Citizens seek to promote a vote on whether a popularly elected officeholder continues." }
    ],
    glosario: [
      { termino: "Citizenship", definicion: "The status that allows rights and duties to be exercised within a political community." },
      { termino: "Participatory democracy", definicion: "A model in which citizens take part in decisions and public affairs through different forms of participation." },
      { termino: "Participation mechanism", definicion: "A legal or institutional tool through which citizens can take part in public affairs." },
      { termino: "Promoter", definicion: "A person, group or organisation that drives certain participation mechanisms, under the applicable rules." },
      { termino: "Citizen endorsements", definicion: "Expressions of support (such as signatures) required for certain initiatives of popular origin." },
      { termino: "Electoral roll", definicion: "The register used to determine the electorate in the processes where it applies." },
      { termino: "Social oversight", definicion: "Monitoring carried out by citizens of public administration." },
      { termino: "Accountability", definicion: "A process through which entities explain and justify their performance to citizens." },
      { termino: "Public body", definicion: "A collegiate body, such as a municipal council or a departmental assembly, with functions defined by the Constitution and the law." }
    ],
    controlSocial: [
      { titulo: "Accountability", texto: "Spaces and processes through which entities explain their performance." },
      { titulo: "Citizen oversight committees (veedurías)", texto: "Organisations or citizens who monitor and keep social watch over public administration." },
      { titulo: "Social dialogue", texto: "Interaction between citizens, organisations and institutions to address public matters." }
    ],
    datosCuriosos: [
      "Citizen participation is recognised by the 1991 Political Constitution.",
      "Colombia is a participatory democracy.",
      "The tutela action is one of the most used mechanisms to protect fundamental rights.",
      "Participation can also be exercised in nearby spaces, such as school government or neighbourhood community meetings."
    ],
    resumen: "Citizen participation mechanisms let Colombians take part in the country's decisions, defend their rights and oversee the authorities. Knowing them — and knowing which one to use in each situation — is an essential part of exercising informed and responsible citizenship."
  }
});

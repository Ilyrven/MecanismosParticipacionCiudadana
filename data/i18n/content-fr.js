/**
 * data/i18n/content-fr.js — Contenu éducatif en français (mécanismes + informations générales + glossaire).
 * Dictionnaire statique (aucune traduction automatique à l'exécution). Se superpose aux originaux espagnols.
 * Les jeux et les quiz NE sont PAS traduits : ils restent en espagnol par conception.
 */
RCI18n.registerContent("fr", {
  mecanismos: {
    "tutela": {
      nombre: "Action de tutelle (tutela)",
      descripcionCorta: "Protège immédiatement les droits fondamentaux lorsqu'ils sont violés ou menacés.",
      resumenCarta: "Mécanisme judiciaire destiné à protéger les droits fondamentaux lorsqu'ils sont violés ou menacés, conformément aux exigences constitutionnelles et légales.",
      ideaClave: "Protection des droits",
      queEs: "C'est un mécanisme judiciaire de protection immédiate auquel toute personne peut recourir lorsqu'elle estime que l'un de ses droits fondamentaux est violé ou menacé par l'action ou l'omission d'une autorité publique et, dans certains cas, de particuliers.",
      paraQueSirve: "Il sert à demander à un juge d'ordonner rapidement la protection effective d'un droit fondamental (comme la vie, la santé, l'égalité ou le procès équitable) lorsqu'il n'existe pas d'autre moyen de défense aussi efficace, ou lorsqu'il est utilisé comme mesure transitoire pour éviter un préjudice irrémédiable.",
      quienPuedeUsarlo: "Toute personne, directement ou par l'intermédiaire d'un représentant, sans avoir besoin d'être avocat. Elle peut aussi être déposée par le Défenseur du peuple ou les personeros municipaux au nom d'une autre personne.",
      caracteristicas: [
        "Elle est prioritaire et sommaire : le juge doit statuer dans un délai bref.",
        "Elle peut être déposée devant n'importe quel juge du lieu où la violation s'est produite.",
        "Elle ne requiert ni avocat ni formalités particulières ; elle peut être rédigée à la main.",
        "La décision peut être révisée ensuite par la Cour constitutionnelle.",
        "Elle est subsidiaire : elle est recevable lorsqu'il n'existe pas d'autre recours judiciaire, sauf si elle sert à éviter un préjudice irrémédiable."
      ],
      ejemplo: "Une assurance santé (EPS) refuse d'autoriser un traitement médical urgent prescrit par un spécialiste ; le patient dépose une tutela et le juge ordonne à l'EPS d'autoriser l'intervention dans un délai strict.",
      datoHistorico: "Elle a été créée par la Constitution de 1991 et réglementée par le décret 2591 de 1991. Elle est rapidement devenue l'un des mécanismes les plus utilisés par les Colombiens pour défendre leurs droits.",
      constitucion91: "Elle est consacrée par l'article 86 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Le délai général dont dispose le juge pour statuer est de 10 jours ouvrables.",
        "La décision doit être exécutée immédiatement, même si elle a été contestée.",
        "Elle n'est pas recevable pour réclamer à elle seule des droits économiques, sociaux ou culturels, sauf s'ils sont directement liés à un droit fondamental."
      ]
    },
    "derecho-peticion": {
      nombre: "Droit de pétition",
      descripcionCorta: "Permet de demander des informations ou de prier les autorités de régler une affaire.",
      resumenCarta: "Droit fondamental qui permet d'adresser des pétitions respectueuses aux autorités et d'obtenir une réponse conformément aux règles légales.",
      ideaClave: "Demander des réponses",
      queEs: "C'est le droit fondamental de toute personne d'adresser des demandes respectueuses aux autorités et, dans certains cas, à des organisations privées, et d'obtenir une réponse rapide et sur le fond.",
      paraQueSirve: "Il sert à demander des informations, à solliciter des copies de documents, à formuler des plaintes ou des réclamations, ou à demander l'intervention d'une autorité face à une situation concrète.",
      quienPuedeUsarlo: "Toute personne, physique ou morale, sans avoir besoin d'un avocat ni de justifier d'un intérêt particulier dans la plupart des cas.",
      caracteristicas: [
        "Il peut être exercé oralement ou par écrit, y compris par voie électronique.",
        "Il ne requiert ni formules consacrées ni connaissances juridiques.",
        "L'autorité doit répondre sur le fond ; accuser réception ne suffit pas.",
        "S'il n'y a pas de réponse ou si elle est incomplète, il peut être protégé par une action de tutelle."
      ],
      ejemplo: "Un citoyen demande par écrit à la mairie des informations sur l'état d'un projet de revêtement de chaussée dans son quartier, et l'entité doit lui répondre dans le délai légal.",
      datoHistorico: "Le droit de pétition existait avant 1991, mais la Constitution l'a élevé au rang de droit fondamental et la loi 1755 de 2015 a actualisé sa réglementation générale.",
      constitucion91: "Il est consacré par l'article 23 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Le délai général de réponse est de 15 jours ouvrables, sauf délais spéciaux selon le type de demande.",
        "Pour les demandes d'informations ou de documents, le délai peut être différent selon la loi.",
        "L'absence de réponse dans les délais peut constituer une faute disciplinaire pour le fonctionnaire."
      ]
    },
    "referendo": {
      nombre: "Référendum",
      descripcionCorta: "Appelle le peuple à approuver ou à rejeter un projet de norme ou une norme en vigueur.",
      resumenCarta: "Mécanisme par lequel le peuple peut approuver ou rejeter des propositions normatives, ou décider de l'abrogation d'une norme, selon la modalité.",
      ideaClave: "Décider sur des normes",
      queEs: "C'est la convocation adressée au peuple pour qu'il approuve ou rejette un projet de norme juridique (référendum d'approbation) ou abroge une norme déjà en vigueur (référendum d'abrogation), en tout ou en partie.",
      paraQueSirve: "Il permet aux citoyens de décider directement, par le vote, si une norme doit entrer en vigueur, être maintenue ou cesser d'exister.",
      quienPuedeUsarlo: "Il peut être proposé par les citoyens, au moyen d'une initiative populaire soutenue par le nombre de signatures exigé par la loi, par le Gouvernement ou par le Congrès, selon le type de référendum.",
      caracteristicas: [
        "Il peut être national, départemental, municipal, de district ou local.",
        "Des seuils de participation doivent être atteints pour que le résultat soit valide.",
        "Il existe des référendums constitutionnels (pour réformer la Constitution) et des référendums légaux.",
        "Le vote est secret et a lieu un jour d'élection."
      ],
      ejemplo: "Un groupe de citoyens recueille des signatures pour proposer un référendum visant à abroger une loi précise qu'ils jugent contraire à l'intérêt général.",
      datoHistorico: "Le mécanisme a été développé en détail par la loi 134 de 1994, puis ajusté par la loi statutaire 1757 de 2015, qui a actualisé plusieurs règles de participation citoyenne.",
      constitucion91: "Prévu notamment par les articles 103 et 170 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Le référendum d'abrogation d'une loi requiert la signature d'un nombre de citoyens équivalant à 10 % du corps électoral.",
        "Pour que le résultat soit valide, un seuil minimal de participation est généralement exigé.",
        "Il diffère du plébiscite car le référendum porte sur une norme concrète, et non sur une politique de l'Exécutif."
      ]
    },
    "plebiscito": {
      nombre: "Plébiscite",
      descripcionCorta: "Le Président consulte le peuple sur une décision capitale de politique nationale.",
      resumenCarta: "Mécanisme par lequel le peuple se prononce sur une décision politique du Gouvernement, conformément à la Constitution et à la loi.",
      ideaClave: "Décision politique",
      queEs: "C'est le mécanisme par lequel le Président de la République convoque le peuple pour qu'il soutienne ou rejette une décision d'importance nationale qu'il revient à l'Exécutif de prendre.",
      paraQueSirve: "Il sert à légitimer, par le vote populaire direct, une décision politique importante que le Gouvernement juge nécessaire de soumettre au peuple.",
      quienPuedeUsarlo: "La convocation appartient exclusivement au Président de la République, avec la signature de tous les ministres, après information préalable du Congrès.",
      caracteristicas: [
        "Il est de portée nationale.",
        "Le Congrès peut rejeter la convocation s'il estime qu'elle ne remplit pas les conditions légales.",
        "Son résultat oblige le Gouvernement lorsque les seuils de participation exigés sont atteints.",
        "Il ne sert ni à modifier la Constitution ni à réformer des lois précises."
      ],
      ejemplo: "En 2016, le Gouvernement colombien a convoqué un plébiscite pour que les citoyens soutiennent ou rejettent l'accord final de fin du conflit armé.",
      datoHistorico: "Le plébiscite de 2016 sur l'Accord de paix est l'exemple le plus connu de ce mécanisme dans l'histoire récente de la Colombie.",
      constitucion91: "Il est réglementé par l'article 103 de la Constitution politique de la Colombie et développé par la loi 134 de 1994.",
      datosImportantes: [
        "Il requiert un seuil minimal de participation pour être valide.",
        "Le Président ne peut pas convoquer de plébiscite sur les états d'exception ni sur les sujets que la loi exclut expressément.",
        "Il diffère du référendum car il ne porte pas sur un texte normatif, mais sur une décision politique."
      ]
    },
    "consulta-popular": {
      nombre: "Consultation populaire",
      descripcionCorta: "Le peuple répond à une question de caractère général sur un sujet important.",
      resumenCarta: "Mécanisme par lequel une question sur un sujet d'importance est soumise au peuple, selon le cadre et la procédure correspondants.",
      ideaClave: "Opinion citoyenne",
      queEs: "C'est la question de caractère général soumise au peuple, au niveau national, départemental, municipal, de district ou local, afin qu'il se prononce formellement à ce sujet.",
      paraQueSirve: "Elle permet aux autorités (nationales ou territoriales) de connaître directement la volonté des citoyens sur un sujet important avant de prendre une décision.",
      quienPuedeUsarlo: "Elle peut être convoquée par le Président, les gouverneurs ou les maires, selon le niveau territorial, avec l'avis favorable préalable de l'organe correspondant (Sénat, assemblée ou conseil), ou promue par initiative citoyenne.",
      caracteristicas: [
        "La question doit être rédigée clairement afin de pouvoir y répondre par oui ou par non.",
        "Elle peut être convoquée au niveau national ou territorial.",
        "Elle requiert l'avis préalable de l'assemblée publique correspondante lorsqu'elle est convoquée par l'élu.",
        "Le résultat est obligatoire si le seuil de participation exigé par la loi est atteint."
      ],
      ejemplo: "Une commune convoque une consultation populaire pour demander à ses habitants s'ils sont d'accord avec la réalisation d'un projet à fort impact environnemental sur son territoire.",
      datoHistorico: "Elle a été utilisée dans plusieurs communes de Colombie pour consulter les citoyens sur des projets à fort impact environnemental ou territorial.",
      constitucion91: "Elle est prévue par l'article 103 de la Constitution politique de la Colombie et développée par la loi 134 de 1994 et la loi 1757 de 2015.",
      datosImportantes: [
        "Le résultat est obligatoire lorsqu'au moins un tiers du corps électoral participe et que la majorité des suffrages valides va dans le même sens, selon la réglementation en vigueur.",
        "Les autorités doivent adopter les mesures nécessaires pour donner effet à la décision populaire.",
        "Elle diffère du référendum car elle ne porte pas sur un texte normatif, mais sur une question générale."
      ]
    },
    "cabildo-abierto": {
      nombre: "Cabildo ouvert (cabildo abierto)",
      descripcionCorta: "Réunion publique des conseils ou comités où la communauté participe directement.",
      resumenCarta: "Espace public de participation où les citoyens peuvent intervenir pour discuter de questions d'intérêt communautaire devant les assemblées correspondantes.",
      ideaClave: "Débat communautaire",
      queEs: "C'est la réunion publique des conseils de district, des conseils municipaux ou des comités administratifs locaux, au cours de laquelle les habitants peuvent participer directement pour discuter de sujets d'intérêt pour la communauté.",
      paraQueSirve: "Il permet aux habitants d'une commune, d'un district, d'une localité, d'un quartier ou d'un corregimiento de présenter des propositions et d'exposer leurs besoins directement à l'assemblée publique correspondante.",
      quienPuedeUsarlo: "Il peut être demandé par un nombre de citoyens fixé par la loi, selon la population de la collectivité territoriale.",
      caracteristicas: [
        "Il se tient au moins une fois par période de sessions du conseil, comme le prévoit la loi.",
        "Toute personne inscrite peut prendre la parole, sans toutefois voter les décisions de l'assemblée.",
        "Les autorités convoquées doivent répondre par écrit aux préoccupations soulevées.",
        "Il peut traiter de budget, de travaux publics, de sécurité, de santé, d'éducation, entre autres sujets locaux."
      ],
      ejemplo: "Les habitants d'un quartier demandent un cabildo ouvert devant le conseil municipal pour exposer le besoin urgent d'améliorer l'éclairage public de leur secteur.",
      datoHistorico: "Bien que le cabildo ait des racines dans la tradition coloniale hispano-américaine, le cabildo ouvert comme mécanisme moderne de participation a été développé par la loi 134 de 1994.",
      constitucion91: "Il est prévu par l'article 103 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Il n'a pas de caractère décisionnel en soi : l'assemblée publique conserve le pouvoir de décider.",
        "Les porte-parole doivent s'inscrire au préalable auprès du secrétariat de l'assemblée.",
        "C'est l'un des mécanismes les plus utilisés au niveau local, car il est facilement accessible à la communauté."
      ]
    },
    "iniciativa-popular": {
      nombre: "Initiative populaire législative et normative",
      descripcionCorta: "Permet aux citoyens de présenter des projets de loi ou de norme devant les assemblées publiques.",
      resumenCarta: "Droit politique qui permet à un groupe de citoyens de présenter des propositions normatives pour qu'elles soient débattues par l'assemblée publique compétente.",
      ideaClave: "Proposition citoyenne",
      queEs: "C'est le droit politique d'un groupe de citoyens de présenter un projet d'acte législatif, de loi, d'ordonnance, d'accord ou de résolution locale devant l'assemblée publique correspondante, afin qu'elle l'examine et statue.",
      paraQueSirve: "Elle permet aux citoyens organisés de proposer directement des changements normatifs sans dépendre uniquement de l'initiative des parlementaires, députés départementaux ou conseillers municipaux.",
      quienPuedeUsarlo: "Un groupe de citoyens réunissant le nombre de signatures exigé par la loi, selon le niveau (national, départemental, municipal, de district ou local).",
      caracteristicas: [
        "Le projet doit obligatoirement être examiné par l'assemblée publique correspondante.",
        "Elle requiert le soutien d'un nombre de signatures équivalant à un pourcentage du corps électoral concerné.",
        "Les porte-parole de l'initiative peuvent participer au débat sur le projet.",
        "Elle peut porter sur des réformes constitutionnelles, des lois, des ordonnances ou des accords, selon le niveau."
      ],
      ejemplo: "Un groupe de citoyens recueille des signatures pour présenter au Congrès un projet de loi sur un sujet d'intérêt social qu'ils estiment négligé.",
      datoHistorico: "Elle a d'abord été réglementée par la loi 134 de 1994, puis actualisée par la loi 1757 de 2015, qui a ajusté les exigences de signatures et les procédures.",
      constitucion91: "Elle est prévue par les articles 103 et 155 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Pour les projets de loi présentés au Congrès, le soutien d'un nombre de signatures équivalant à un pourcentage du corps électoral en vigueur est exigé.",
        "L'assemblée publique n'est pas obligée d'approuver le projet, mais elle est obligée de l'examiner.",
        "Elle diffère du référendum car elle vise à créer ou modifier une norme dès son origine, et non à approuver ou abroger une norme existante."
      ]
    },
    "revocatoria-mandato": {
      nombre: "Révocation du mandat",
      descripcionCorta: "Permet aux citoyens de mettre fin au mandat d'un gouverneur ou d'un maire.",
      resumenCarta: "Mécanisme par lequel les citoyens peuvent promouvoir, dans le respect des exigences légales, la fin anticipée du mandat de certains élus au suffrage populaire.",
      ideaClave: "Contrôle politique",
      queEs: "C'est le mécanisme par lequel les citoyens mettent fin au mandat confié à un gouverneur ou à un maire, avant la fin de la période pour laquelle il a été élu.",
      paraQueSirve: "Il permet aux citoyens d'exercer un contrôle politique direct sur leurs élus territoriaux lorsqu'ils estiment qu'ils ne respectent pas le programme de gouvernement ou que leur action est insatisfaisante.",
      quienPuedeUsarlo: "Les citoyens qui composent le corps électoral du département, du district ou de la commune concerné, en recueillant des signatures dans le pourcentage exigé par la loi.",
      caracteristicas: [
        "Elle ne s'applique qu'aux gouverneurs et aux maires élus au suffrage populaire.",
        "Une période minimale du mandat doit s'être écoulée avant de pouvoir la demander.",
        "Elle est soumise au vote un jour d'élection et requiert un seuil minimal de participation et de voix en faveur.",
        "Si elle aboutit, de nouvelles élections sont convoquées pour achever la période."
      ],
      ejemplo: "Un groupe de citoyens d'une commune recueille des signatures pour demander la révocation du mandat du maire, au motif du non-respect du programme de gouvernement sur lequel il a été élu.",
      datoHistorico: "Elle a été réglementée à l'origine par la loi 134 de 1994 et modifiée en profondeur par la loi 1757 de 2015, qui a supprimé l'obligation d'invoquer un motif précis.",
      constitucion91: "Elle est consacrée par les articles 40 et 103 de la Constitution politique de la Colombie.",
      datosImportantes: [
        "Depuis la loi 1757 de 2015, il n'est plus nécessaire d'invoquer un motif précis pour la demander.",
        "Le seuil de voix requis pour qu'elle aboutisse a fait l'objet de plusieurs réformes légales.",
        "Elle diffère de la destitution, qui est une sanction disciplinaire imposée par une autorité, et non un mécanisme de participation citoyenne."
      ]
    }
  },

  general: {
    queEs: "Les mécanismes de participation citoyenne sont des instruments établis par la Constitution politique de la Colombie qui permettent aux citoyens d'intervenir dans les décisions publiques, d'exercer un contrôle sur les gouvernants et de protéger leurs droits. La participation ne se limite pas à voter lors des élections : elle comprend aussi des mécanismes institutionnels, des organisations sociales, des espaces communautaires et des actions pour dialoguer avec les autorités. Son objectif est de renforcer la démocratie et de permettre à toutes les personnes de participer activement à la vie politique du pays.",
    importancia: [
      { texto: "Ils permettent aux citoyens de participer aux décisions importantes." },
      { texto: "Ils aident à protéger les droits fondamentaux." },
      { texto: "Ils renforcent la démocratie au-delà des élections." },
      { texto: "Ils favorisent la transparence et le contrôle de l'usage des ressources publiques." },
      { texto: "Ils permettent de contrôler la gestion des fonctionnaires publics." }
    ],
    importanciaRapida: [{ texto: "Participation" }, { texto: "Droits" }, { texto: "Démocratie" }, { texto: "Citoyenneté" }],
    marcoLegal: [
      { titulo: "Constitution politique", texto: "Elle renforce le modèle de démocratie participative. L'article 40 reconnaît le droit de participer à la formation, à l'exercice et au contrôle du pouvoir politique ; l'article 103 énumère les mécanismes de participation du peuple." },
      { titulo: "Loi 134 de 1994", texto: "L'une des premières lois statutaires consacrées au développement des mécanismes de participation prévus par la Constitution : initiative populaire, référendum, consultation populaire, révocation du mandat, plébiscite et cabildo ouvert." },
      { titulo: "Loi 1755 de 2015", texto: "Elle réglemente le droit fondamental de pétition : comment l'exercer, ce que l'on peut demander et dans quels délais l'autorité doit répondre." },
      { titulo: "Loi 1757 de 2015", texto: "Elle actualise et développe les règles des six mécanismes de participation qu'elle réglemente directement, et comprend aussi des dispositions sur la reddition de comptes et les veedurías citoyennes (comités de contrôle citoyen)." }
    ],
    diferencias: [
      { paraQueSirve: "Protéger les droits fondamentaux.", votacion: "Ce n'est pas un vote populaire." },
      { paraQueSirve: "Demander des informations ou des réponses.", votacion: "Non." },
      { paraQueSirve: "Décider sur certaines normes.", votacion: "Oui, lorsque cela s'applique." },
      { paraQueSirve: "Se prononcer sur une décision politique du Gouvernement.", votacion: "Oui." },
      { paraQueSirve: "Répondre à une question d'importance publique.", votacion: "Oui." },
      { paraQueSirve: "Dialoguer publiquement sur des sujets communautaires.", votacion: "Non, en tant que mécanisme général de vote populaire." },
      { paraQueSirve: "Présenter des propositions normatives.", votacion: "Pas nécessairement ; elle engage une procédure." },
      { paraQueSirve: "Décider du maintien d'un élu.", votacion: "Oui." }
    ],
    derechosQueProtegen: ["Éducation", "Santé", "Égalité", "Vie", "Liberté", "Participation citoyenne", "Procès équitable", "Environnement sain"],
    quienesPuedenUsarlos: "En général, tous les citoyens colombiens peuvent exercer ces mécanismes, bien que certains aient des exigences particulières (comme recueillir des signatures, atteindre des seuils de participation ou appartenir au corps électoral du territoire concerné).",
    notaImportante: "Bien que ce projet les étudie ensemble parce qu'ils sont liés à la participation et à la relation entre citoyens et État, juridiquement les 8 sujets n'appartiennent pas tous à la même catégorie. Les 6 mécanismes directement réglementés par la loi 1757 de 2015 sont : l'initiative populaire et normative, le référendum, la consultation populaire, la révocation du mandat, le plébiscite et le cabildo ouvert. L'action de tutelle et le droit de pétition sont des droits/outils constitutionnels enseignés avec eux en raison de leur lien avec la participation, mais ils ne font pas partie de ces 6 mécanismes de la loi 1757.",
    erroresFrecuentes: [
      "Confondre le plébiscite avec le référendum.",
      "Penser que tous les mécanismes fonctionnent par un vote.",
      "Affirmer que la tutelle et le droit de pétition sont des mécanismes de la loi 1757 de 2015.",
      "Confondre une pétition avec une initiative populaire normative.",
      "Penser qu'une initiative populaire devient automatiquement une loi.",
      "Supposer que n'importe quel fonctionnaire peut faire l'objet d'une révocation, sans vérifier les fonctions et exigences applicables.",
      "N'apprendre que des définitions sans comprendre à quoi sert chaque outil."
    ],
    participacionResponsable: [
      "S'informer avant de prendre une décision.",
      "Consulter des sources fiables et distinguer l'information des opinions ou des rumeurs.",
      "Connaître le mécanisme adapté à chaque situation.",
      "Respecter les opinions différentes.",
      "Argumenter les propositions avec des raisons et des preuves.",
      "Participer sans recourir à la violence ni à l'intimidation.",
      "Connaître les exigences et les procédures légales de chaque mécanisme formel.",
      "Suivre les décisions et exiger la transparence."
    ],
    casosPracticos: [
      { situacion: "Une communauté a besoin d'informations sur un projet d'une entité publique." },
      { situacion: "Une personne estime qu'un droit fondamental est violé et cherche une protection judiciaire." },
      { situacion: "Un groupe de citoyens veut présenter une proposition de norme à l'assemblée compétente." },
      { situacion: "Une norme ou une proposition normative est soumise à la décision populaire." },
      { situacion: "Le Gouvernement soumet au peuple une décision politique d'une importance particulière." },
      { situacion: "Une question sur un sujet d'importance est soumise aux citoyens." },
      { situacion: "Les habitants d'un territoire veulent discuter publiquement d'un sujet devant l'assemblée correspondante." },
      { situacion: "Des citoyens cherchent à promouvoir un vote sur le maintien d'un élu au suffrage populaire." }
    ],
    glosario: [
      { termino: "Citoyenneté", definicion: "Condition qui permet d'exercer des droits et des devoirs au sein d'une communauté politique." },
      { termino: "Démocratie participative", definicion: "Modèle dans lequel les citoyens interviennent dans les décisions et les affaires publiques par différentes formes de participation." },
      { termino: "Mécanisme de participation", definicion: "Outil juridique ou institutionnel par lequel les citoyens peuvent intervenir dans les affaires publiques." },
      { termino: "Promoteur", definicion: "Personne, groupe ou organisation qui soutient certains mécanismes de participation, selon les règles applicables." },
      { termino: "Soutiens citoyens", definicion: "Manifestations d'appui (comme les signatures) exigées pour certaines initiatives d'origine populaire." },
      { termino: "Corps électoral", definicion: "Registre utilisé pour déterminer l'ensemble des électeurs dans les processus où cela s'applique." },
      { termino: "Contrôle social", definicion: "Suivi exercé par les citoyens sur la gestion publique." },
      { termino: "Reddition de comptes", definicion: "Processus par lequel les entités expliquent et justifient leur gestion devant les citoyens." },
      { termino: "Assemblée publique (corporación pública)", definicion: "Organe collégial, comme un conseil municipal ou une assemblée départementale, dont les fonctions sont définies par la Constitution et la loi." }
    ],
    controlSocial: [
      { titulo: "Reddition de comptes", texto: "Espaces et processus par lesquels les entités expliquent leur gestion." },
      { titulo: "Veedurías citoyennes", texto: "Organisations ou citoyens qui assurent le suivi et la vigilance sociale de la gestion publique." },
      { titulo: "Dialogue social", texto: "Interaction entre citoyens, organisations et institutions pour traiter des affaires publiques." }
    ],
    datosCuriosos: [
      "La participation citoyenne est reconnue par la Constitution politique de 1991.",
      "La Colombie est une démocratie participative.",
      "L'action de tutelle est l'un des mécanismes les plus utilisés pour protéger les droits fondamentaux.",
      "La participation peut aussi s'exercer dans des espaces proches, comme le gouvernement scolaire ou les réunions de quartier."
    ],
    resumen: "Les mécanismes de participation citoyenne permettent aux Colombiens de participer aux décisions du pays, de défendre leurs droits et d'exercer un contrôle sur les autorités. Les connaître — et savoir lequel utiliser dans chaque situation — est une part essentielle d'une citoyenneté informée et responsable."
  }
});

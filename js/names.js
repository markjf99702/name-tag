// The names. Each theme lists entries separated by commas: Name (tags).
// Tags, all optional:
//   m, f                 boy or girl (no tag: either)
//   black white grey ginger brown golden spotty stripy     coat
//   sleepy bouncy sweet grumpy clever posh chaotic shy     personality
//   tiny big             size
//   dog cat bird fish small reptile horse    especially good for that animal
//   !cat (and so on)     only for that animal, like a cat pun
// A name can sit in several themes; its tags are merged.

export const SPECIES = [
  { id: 'dog', label: 'Dog', emoji: '🐶' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'small', label: 'Small & furry', emoji: '🐹' },
  { id: 'bird', label: 'Bird', emoji: '🐦' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'reptile', label: 'Reptile', emoji: '🦎' },
  { id: 'horse', label: 'Horse', emoji: '🐴' },
];

export const COATS = ['black', 'white', 'grey', 'ginger', 'brown', 'golden', 'spotty', 'stripy'];
export const TRAITS = ['sleepy', 'bouncy', 'sweet', 'grumpy', 'clever', 'posh', 'chaotic', 'shy'];

// weird: 0 is what most people would call a normal pet name, 3 is properly odd.
export const THEMES = [
  { id: 'classic', label: 'Classics', weird: 0, names: `
    Luna (f), Bella (f), Max (m), Charlie, Cooper (m), Milo (m), Lucy (f), Daisy (f sweet), Buddy (m), Rocky (m big),
    Bailey, Sadie (f), Molly (f sweet), Stella (f), Bear (m big brown), Duke (m posh big), Teddy (m brown sweet),
    Tucker (m), Oliver (m), Leo (m ginger golden), Lola (f), Zoe (f), Nala (f golden cat), Coco (f brown), Rosie (f sweet),
    Penny (f brown), Ruby (f ginger), Winnie (f), Maggie (f), Loki (m chaotic), Ollie (m), Finn (m fish), Louie (m),
    Gus (m), Jack (m), Toby (m), Murphy (m), Zeus (m big), Chloe (f), Lily (f white), Sophie (f), Roxy (f), Gracie (f sweet),
    Ellie (f), Piper (f bird), Kona, Harley, Moose (m big brown), Riley, Bentley (m), Ace (m), Oscar (m grumpy),
    Simba (m ginger golden cat), Kitty (f !cat), Tiger (stripy ginger cat), Smokey (grey black), Shadow (black grey shy),
    Cleo (f cat), Mia (f), Callie (f spotty cat), Pepper (spotty black grey), Misty (f grey), Jasper (m), Felix (m black cat),
    Sammy, George (m), Frankie, Archie (m), Henry (m), Bruno (m brown big), Dexter (m clever), Ziggy (bouncy), Remy (m),
    Rex (m big), Bandit (m chaotic spotty), Buster (m bouncy), Abby (f), Honey (f golden sweet), Ginger (ginger), Minnie (f tiny),
    Olive (f), Pumpkin (ginger), Poppy (f), Mittens (white cat), Socks (white cat), Whiskers (cat small), Tigger (stripy ginger bouncy),
    Midnight (black), Salem (black cat), Snowball (white), Oreo (spotty black white small), Patch (spotty), Spot (spotty dog),
    Fido (m dog), Rover (m dog), Lady (f posh dog), Princess (f posh), Angel (sweet white), Sugar (f sweet white), Blue (grey),
    Rusty (m ginger), Sandy (golden), Goldie (golden fish), Bubbles (fish bouncy), Nemo (fish ginger), Polly (f bird), Kiwi (bird),
    Thumper (small bouncy), Peanut (tiny small), Nibbles (small), Squeaky (small tiny), Buttercup (golden horse sweet),
    Thunder (horse big), Spirit (horse), Dusty (brown grey horse), Blaze (horse ginger), Champ (m horse), Chester (m),
    Benji (m dog), Sparky (bouncy), Sassy (f), Jake (m), Sam, Scout, Marley, Koda (m), Nova (f), Apollo (m), Otis (m), Hank (m),
    Cash (m), Theo (m), Arlo (m), Mabel (f), Hazel (f brown), Willow (f), Boots (cat black white), Binx (black cat), Mochi (white sweet),
    Pickles (chaotic), Spike (reptile), Iggy (reptile), Shelly (f reptile), Sunny (golden bird), Mango (golden bird), Clover (f small),
    Bun (small), Biscuit (golden brown small), Star (horse), Dolly (f), Frodo (m tiny), Ruffles (small), Sheldon (m reptile),
    Simon (m cat), Gill (fish), Draco (m reptile), Yoshi (reptile), Lucky (horse dog)` },

  { id: 'people', label: 'People names', weird: 1, names: `
    Arthur (m), Frank (m), Walter (m grumpy), Stanley (m), Murray (m), Hugo (m), Rupert (m posh), Reggie (m), Alfie (m),
    Freddie (m), Albie (m), Monty (m posh), Barney (m), Benny (m), Bertie (m), Winston (m posh), Millie (f), Ivy (f), Iris (f),
    Nora (f), Lottie (f), Matilda (f clever), Maude (f grumpy), Edie (f), Elsie (f), Evie (f), Fern (f), Josie (f), Lulu (f),
    Martha (f), Nellie (f), Peggy (f), Tilly (f), Violet (f shy), Willa (f), Zelda (f), Lenny (m), Marvin (m), Norm (m),
    Ozzie (m), Percy (m), Ralph (m), Sid (m), Vinnie (m), Wally (m), Wilbur (m), Wilson (m), Bodhi (m), Enzo (m), Jonah (m),
    Moe (m), Ned (m), Rufus (m), Ernie (m), Eddie (m), Birdie (f bird), Bonnie (f), Clara (f), Etta (f), Frida (f), Greta (f),
    Hattie (f), June (f), Kit (f), Lena (f), Mimi (f), Pip (tiny), Rita (f), Tess (f), Wren (f bird), Ada (f clever), Agnes (f),
    Bea (f), Dot (f tiny), Ethel (f), Ezra (m), Fergus (m), Gilbert (m), Hamish (m), Ian (m), Iggy (m), Jude (m), Kip (m sleepy),
    Lionel (m), Mack (m big), Nico (m), Pablo (m), Quincy (m), Ronnie (m), Sonny (m), Tito (m), Uma (f), Vera (f), Wanda (f),
    Yogi (m), Ziggy (m), Juno (f), Pearl (f white), Opal (f), Hugh (m), Neville (m), Dora (f), Flora (f), Gigi (f)` },

  { id: 'oldfolks', label: 'Old folks', weird: 2, names: `
    Gladys (f grumpy), Mildred (f grumpy), Ethel (f), Harold (m grumpy), Walter (m grumpy), Mabel (f sleepy), Agnes (f),
    Bertha (f big), Myrtle (f reptile), Edna (f), Vera (f), Ruth (f), Irene (f), Florence (f posh), Winifred (f posh),
    Gertrude (f grumpy), Clarence (m), Herbert (m), Chester (m), Vernon (m), Leonard (m), Eugene (m), Floyd (m), Bernard (m sleepy big),
    Norman (m), Dorothy (f), Frances (f), Ida (f), Hattie (f), Nellie (f), Cecil (m posh), Horace (m), Mortimer (m posh),
    Ernest (m), Alfred (m), Albert (m), Doris (f sleepy), Enid (f), Maud (f), Mavis (f), Phyllis (f), Muriel (f), Beryl (f),
    Bernadette (f), Lloyd (m), Milton (m), Irving (m), Marjorie (f), Harriet (f), Esther (f), Dolores (f), Wilma (f), Betty (f),
    Shirley (f), Norma (f), Gloria (f), Hilda (f), Blanche (f white), Earl (m grey), Homer (m), Virgil (m), Wendell (m),
    Gordon (m), Stanley (m), Humphrey (m sleepy), Ambrose (m), Clement (m), Sidney (m), Mervyn (m), Howard (m), Morris (m),
    Maurice (m), Gerald (m grumpy reptile), Myrna (f), Lorraine (f), Loretta (f), Rosalind (f), Pearl (f white), Opal (f),
    Otis (m), Percy (m), Wilbur (m), Stanislaus (m), Thelma (f), Louise (f), Eunice (f), Imogen (f), Constance (f),
    Barnaby (m), Cyril (m), Reginald (m posh), Methuselah (m reptile sleepy), Grandpa (m sleepy), Nana (f sleepy)` },

  { id: 'office', label: 'Someone at work', weird: 3, names: `
    Kevin (m), Gary (m), Steve (m), Dave (m), Doug (m), Brenda (f), Linda (f), Janet (f), Deb (f), Craig (m), Todd (m),
    Brad (m), Kyle (m), Susan (f), Sharon (f), Pam (f), Jeff (m), Greg (m), Carl (m), Tina (f), Barb (f), Lisa (f), Mike (m),
    Rick (m), Ron (m), Tammy (f), Trish (f), Nancy (f), Paul (m), Phil (m), Terry (m), Wendy (f), Keith (m), Nigel (m),
    Derek (m), Colin (m), Trevor (m), Mandy (f), Julie (f), Diane (f), Denise (f), Sandra (f), Gail (f), Cheryl (f), Kathy (f),
    Donna (f), Glen (m), Barry (m), Darren (m), Wayne (m), Shane (m), Chad (m), Trent (m), Clint (m), Bruce (m), Stu (m),
    Russ (m), Lorna (f), Val (f), Sheila (f), Maureen (f), Bev (f), Jill (f), Tracy (f), Stacy (f), Becky (f), Clive (m),
    Graham (m), Roger (m), Brian (m), Malcolm (m), Dennis (m chaotic), Howard (m), Stuart (m), Geoff (m), Martin (m),
    Norman (m), Neil (m), Carol (f), Judy (f), Marcia (f), Debbie (f), Rhonda (f), Vicki (f), Kelly (f), Toby (m)` },

  { id: 'posh', label: 'Posh', weird: 2, names: `
    Reginald (m posh), Penelope (f posh), Winston (m posh), Beatrice (f posh), Montgomery (m posh), Wellington (m posh),
    Cornelius (m posh), Archibald (m posh), Bartholomew (m posh), Percival (m posh), Theodora (f posh), Genevieve (f posh),
    Octavia (f posh), Rupert (m posh), Ambrose (m posh), Horatio (m posh), Clementine (f posh ginger), Arabella (f posh),
    Duchess (f posh), Duke (m posh), Baron (m posh), Countess (f posh), Admiral (m posh), Barnaby (m posh), Humphrey (m posh),
    Tarquin (m posh), Jeeves (m posh), Fitzgerald (m posh), Alistair (m posh), Cordelia (f posh), Ophelia (f posh),
    Persephone (f posh), Lavinia (f posh), Seraphina (f posh), Evangeline (f posh), Rosalind (f posh), Georgiana (f posh),
    Wilhelmina (f posh), Maximilian (m posh), Leopold (m posh), Ferdinand (m posh), Sebastian (m posh), Benedict (m posh),
    Augustus (m posh), Gatsby (m posh), Monty (m posh), Earl (m posh), Lord (m posh), Marquis (m posh), Baroness (f posh),
    Aurelius (m posh), Cosimo (m posh), Ignatius (m posh), Lysander (m posh), Peregrine (m posh bird), Quentin (m posh),
    Thaddeus (m posh), Ulysses (m posh), Anastasia (f posh), Clarissa (f posh), Esmeralda (f posh), Henrietta (f posh),
    Imogen (f posh), Marguerite (f posh), Philippa (f posh), Rosamund (f posh), Viola (f posh), Winifred (f posh),
    Sir Pounce (m posh !cat), Lady Whiskers (f posh !cat), Lord Barkley (m posh !dog), Sir Hops (m posh !small), Dame Fluff (f posh)` },

  { id: 'famous', label: 'Famous animals', weird: 1, names: `
    Lassie (f dog golden), Snoopy (m dog white spotty), Garfield (m ginger !cat sleepy), Toto (dog tiny), Scooby (m dog brown big),
    Hachi (m dog golden), Laika (f dog), Balto (m dog), Seabiscuit (horse brown), Flipper (fish), Babe (small), Paddington (m brown),
    Bambi (golden), Dumbo (big), Stuart (m tiny small), Hedwig (f white bird), Crookshanks (ginger cat grumpy), Fang (m dog big),
    Buckbeak (bird horse), Marmaduke (m big dog), Beethoven (m big dog brown), Hooch (m big dog brown), Gromit (m dog), Odie (m dog golden),
    Pluto (m dog golden), Goofy (m dog chaotic), Kermit (m reptile), Gonzo (chaotic), Bluey (f dog), Bingo (f dog ginger),
    Clifford (m big ginger dog), Pongo (m spotty dog), Perdita (f spotty dog), Tramp (m dog grey), Bolt (m white dog bouncy),
    Dug (m dog golden), Wishbone (dog spotty), Eddie (m dog), Sylvester (m black cat), Tweety (bird golden), Tom (m grey cat),
    Jerry (m small brown tiny), Figaro (m cat black), Berlioz (m grey cat), Toulouse (m ginger cat), Marie (f white cat),
    Dodger (m dog), Stitch (chaotic), Pascal (m reptile), Maximus (m horse white), Heihei (bird chaotic), Abu (small chaotic),
    Rajah (stripy cat big), Meeko (small grey), Flounder (fish golden), Crush (reptile), Squirt (reptile tiny), Dory (f fish),
    Bruce (m fish big), Jaws (fish big), Keiko (fish), Maru (cat), Boo (dog tiny), Checkers (dog spotty), Fala (dog black),
    Rin Tin Tin (m dog), Old Yeller (m dog golden), Petey (dog spotty), Black Beauty (f horse black), Trigger (m horse golden),
    Silver (horse white grey), Shadowfax (m horse white), Secretariat (m horse ginger), Pegasus (horse white), Mr Bigglesworth (m cat posh),
    Jonesy (m ginger cat), Mrs Norris (f cat grey), Scabbers (small grey), Errol (m bird), Fawkes (bird ginger), Nagini (f reptile),
    Norbert (m reptile), Smaug (m reptile ginger), Toothless (reptile black), Kaa (reptile), Sir Hiss (m !reptile), Iago (bird chaotic),
    Zazu (bird), Rafiki (clever), Hobbes (m stripy ginger cat), Snowy (white dog), Dogmatix (tiny dog white), Totoro (grey big sleepy),
    Jiji (black cat), Ponyo (f fish ginger), Mushu (reptile ginger), Fievel (small tiny), Gizmo (small brown), Doge (dog golden),
    Grumpy Cat (!cat grumpy), Nyan (cat), Remy (m small grey), Hamm (small), Slinky (dog), Pua (small)` },

  { id: 'snacks', label: 'Snacks', weird: 2, names: `
    Pickles (chaotic), Nacho (m ginger), Taco, Waffles (golden), Pretzel (brown), Noodle (golden bouncy), Dumpling (white sleepy),
    Biscuit (golden brown), Muffin (brown sweet), Cupcake (f sweet), Peanut (tiny brown), Cashew, Pistachio, Meatball (big brown),
    Tater Tot (tiny golden), Nugget (golden tiny), Churro (golden), Burrito, Bagel, Pancake (golden sleepy), Crumpet (posh),
    Cookie (spotty brown sweet), Brownie (brown), Oreo (spotty black white), Mochi (white sweet), Sushi, Wasabi, Tofu (white),
    Ramen, Gnocchi, Ravioli, Pesto, Macaroni, Jellybean (tiny sweet), Gumdrop (tiny), Marshmallow (white sweet),
    Butterscotch (golden), Toffee (brown), Fudge (brown), Truffle (brown posh), Tamale, Empanada, Falafel, Gyoza, Bao (white tiny),
    Pierogi, Cheeto (ginger chaotic), Popcorn (white bouncy), Pudding (sleepy sweet), Custard (golden), Meringue (white),
    Cannoli, Tiramisu, Crouton, Scone, Hash Brown (brown), Sausage (brown dog), Tater (brown), Spud (brown), Corndog (golden),
    Mustard (golden), Ketchup (ginger), Relish, Sriracha (ginger chaotic), Tabasco (ginger chaotic), Twinkie (golden),
    Skittles (bouncy), Jelly (sweet), Bonbon (tiny sweet), Doughnut (brown), Cheesecake, Strudel, Baklava, Crepe (posh),
    Brioche (golden posh), Croissant (golden posh), Baguette (posh), Wonton (white), Kimchi (ginger chaotic), Samosa, Chutney,
    Naan, Poppadom (chaotic), Dim Sum, Pop Tart, Flapjack, Trifle, Crumble (brown), Cobbler, Pavlova (white posh), Eclair (posh),
    Macaron (posh), Biscotti, Snickerdoodle (chaotic), Gingersnap (ginger), Shortbread (golden), Pop Rocks (chaotic), Frito,
    Tortilla (reptile), Tortellini (reptile), Quesadilla, Enchilada, Churro, Beignet, Kebab, Hummus, Pita, Sprinkles (spotty bouncy)` },

  { id: 'cheese', label: 'Cheese', weird: 3, names: `
    Brie (f white), Gouda (golden), Feta (white), Cheddar (ginger), Halloumi, Colby (ginger), Stilton (posh spotty), Ricotta (white),
    Mozzarella (white), Parmesan (posh), Havarti, Gruyere (posh), Manchego, Camembert (posh), Roquefort (spotty posh),
    Provolone, Emmental, Monterey Jack (m), Pepper Jack (spotty m), Mascarpone, Burrata (white), Paneer (white),
    Wensleydale (posh), Gorgonzola (spotty), Edam (ginger), Muenster (chaotic), Queso (golden), Swiss (spotty white),
    Fontina, Asiago, Pecorino, Taleggio, Raclette, Limburger (chaotic), Cotija, Oaxaca, Cheese Louise (f), Curd, Nacho Cheese (ginger)` },

  { id: 'drinks', label: 'Drinks', weird: 2, names: `
    Mocha (brown), Latte (brown sweet), Espresso (black bouncy), Chai (brown), Cocoa (brown sweet), Kombucha, Boba (black),
    Matcha, Whiskey (golden brown), Bourbon (brown), Brandy (brown f), Gin, Sherry (f), Merlot (f), Chianti, Mojito, Martini (posh),
    Negroni (ginger), Guinness (black), Porter (black), Stout (black big), Prosecco (bouncy posh), Tequila (chaotic), Sake,
    Kahlua (brown), Bellini (f), Cappuccino (brown white), Americano, Frappe, Cider (golden), Mimosa (ginger), Sangria,
    Margarita (f), Cosmo, Ouzo, Grappa, Soda, Fizz (bouncy), Seltzer, Lemonade (golden), Root Beer (brown), Chamomile (sleepy),
    Earl Grey (grey posh), Darjeeling (posh), Rooibos (ginger), Horchata (white), Milkshake, Smoothie, Cortado, Macchiato,
    Guava, Shandy, Pimm's (posh), Snapple, Yoohoo, Ginger Ale (ginger), Sarsaparilla, Tonic, Dr Pepper (m)` },

  { id: 'fruitveg', label: 'Fruit & veg', weird: 2, names: `
    Turnip, Radish, Parsnip, Sprout (tiny), Kale, Beet, Bean (tiny), Chickpea (tiny golden), Lentil, Pumpkin (ginger),
    Squash, Zucchini, Leek, Rhubarb, Artichoke, Potato (brown), Spud (brown), Pea (tiny), Sweet Pea (sweet), Cabbage,
    Broccoli, Cauliflower (white), Carrot (ginger), Celery, Cucumber, Okra, Yam, Kohlrabi, Fennel, Shallot, Endive (posh),
    Arugula, Olive (f), Pickle, Mango (golden bird), Kiwi (bird), Peaches (f golden sweet), Plum, Apricot (golden),
    Clementine (ginger f), Tangerine (ginger), Cherry (f), Berry, Blueberry, Fig, Lychee, Papaya, Coconut (brown white),
    Banana (golden), Lemon (golden), Lime, Pear, Apple, Quince, Persimmon, Kumquat, Nectarine, Butternut (golden),
    Pomelo, Mandarin (ginger), Sweet Potato (ginger), Jalapeno (chaotic), Habanero (chaotic), Chili (ginger chaotic),
    Pinto Bean (spotty), Edamame, Rutabaga, Taro, Plantain, Raisin, Cranberry, Gooseberry, Elderberry, Huckleberry` },

  { id: 'spices', label: 'Herbs & spices', weird: 2, names: `
    Basil (m), Sage, Clove, Nutmeg (brown), Ginger (ginger), Pepper (spotty grey), Paprika (ginger), Cinnamon (brown),
    Saffron (ginger), Cumin, Rosemary (f), Thyme, Parsley, Dill, Oregano, Juniper (f), Anise, Cardamom, Mint, Chive,
    Tarragon, Fenugreek, Turmeric (golden), Allspice, Vanilla (white sweet), Wasabi, Sumac, Chervil, Lovage, Sorrel (ginger),
    Tamarind, Marjoram (f), Coriander, Cilantro, Za'atar, Salt (white), Pepper Pot, Star Anise, Garam Masala, Sriracha (ginger)` },

  { id: 'junk', label: 'Junk drawer', weird: 3, names: `
    Button (tiny), Zipper (bouncy), Sprocket, Widget, Gizmo (chaotic), Doohickey, Thimble (tiny), Bobbin, Paperclip,
    Thumbtack, Washer, Nickel (grey), Penny (brown), Dime (tiny), Marble, Domino (spotty black white), Keychain, Magnet,
    Spatula, Whisk, Ladle, Sharpie (black), Crayon, Eraser, Staple, Twine, Rivet, Grommet, Bolt (bouncy), Wingnut (chaotic),
    Doodad, Thingamajig, Whatsit, Twist Tie, Rubber Band (bouncy), Tape Measure, Duct Tape (grey), Birthday Candle,
    Soy Sauce (black), Chopstick, Battery, Fuse, Spork, Corkscrew (chaotic), Bottle Cap, Allen Key (m), Zip Tie, Velcro,
    Sticky Note, Coupon, Rubber Duck (golden), Dice (spotty), Yo-Yo (bouncy), Slinky (bouncy), Kazoo (chaotic), Harmonica,
    Screwdriver, Pliers, Tweezers, Hairpin, Shoelace, Takeout Menu, Spare Key, Twisty, Fridge Magnet, Matchbook, Flashlight` },

  { id: 'wrongsize', label: 'The wrong size', weird: 3, names: `
    Peanut (tiny), Tiny (tiny), Pip (tiny), Bean (tiny), Squeak (tiny), Button (tiny), Mouse (tiny grey), Teacup (tiny),
    Pixie (tiny), Sprout (tiny), Bitty (tiny), Minnie (tiny f), Pipsqueak (tiny), Crumb (tiny), Speck (tiny), Tater Tot (tiny),
    Nugget (tiny), Pebble (tiny), Twig (tiny), Jellybean (tiny), Thimble (tiny), Smidge (tiny), Titch (tiny), Shrimp (tiny),
    Tadpole (tiny), Acorn (tiny), Petal (tiny f), Dewdrop (tiny), Kitten (tiny !dog), Cupcake (tiny), Little Bit (tiny),
    Teaspoon (tiny), Dinky (tiny), Munchkin (tiny), Gnocchi (tiny),
    Tank (big), Moose (big), Brutus (big m), Goliath (big m), Titan (big), Diesel (big), Thor (big m), Tyson (big m),
    Bruiser (big), Kong (big), Butch (big m), Spike (big), Rex (big m), Grizzly (big), Mammoth (big), Boulder (big),
    Hercules (big m), Colossus (big), Maximus (big m), Bigfoot (big), Zeus (big m), Atlas (big m), Tsunami (big),
    Avalanche (big), Godzilla (big), Dozer (big), Bulldozer (big), Truck (big), Big Mike (big m), Tonka (big), Rhino (big),
    Hippo (big), Bison (big), Kodiak (big), Yeti (big white), Juggernaut (big), Behemoth (big), Sasquatch (big),
    King Kong (big m), T-Rex (big), Brick (big), Crusher (big), Tractor (big), Mack (big m), Everest (big)` },

  { id: 'puns', label: 'Puns', weird: 3, names: `
    Catsby (m !cat), Chairman Meow (m !cat), Meowzart (m !cat), Cat Damon (m !cat), Catrick Swayze (m !cat), Hairy Pawter (m !cat),
    Clawdia (f !cat), Kitty Purry (f !cat), Cleocatra (f !cat), Catniss (f !cat), Pawdrey Hepburn (f !cat), Pablo Picatso (m !cat),
    Leonardo DiCatprio (m !cat), Purrcy (m !cat), Fur Real (!cat), Sir Pounce-a-lot (m !cat),
    Bark Twain (m !dog), Sherlock Bones (m !dog), Droolius Caesar (m !dog), Chewbarka (m !dog), Doggy Parton (f !dog),
    Mary Puppins (f !dog), Jimmy Chew (m !dog), Woofgang Puck (m !dog), Salvador Dogi (m !dog), Pup Tart (!dog),
    Mutt Damon (m !dog), Bone Jovi (m !dog), Arfur (m !dog), Sir Waggington (m !dog posh), Pawl McCartney (m !dog),
    Brad Pitbull (m !dog), Winnie the Poodle (f !dog), Hairy Paw-ter (m !dog), Ruth Barker Ginsburg (f !dog),
    Fishy McFishface (!fish), Gill Murray (m !fish), Finn Diesel (m !fish), Marlin Monroe (f !fish), Gillbert (m !fish),
    Carp Diem (!fish), Cod Stewart (m !fish), Mr Swimmington (m !fish), Captain Fishbeard (m !fish), Fishstick (!fish),
    Beakonce (f !bird), Feather Locklear (f !bird), Wingston Churchill (m !bird), Polly Esther (f !bird), Tweetie Pie (!bird),
    Captain Squawk (m !bird), Chirpy (!bird), Squawkers (!bird),
    Bun Jovi (m !small), Hare Styles (m !small), Bunnedict Cumberbatch (m !small), Hammy Davis Jr (m !small),
    Hamlet (m !small), Hamilton (m !small), Biggie Smalls (m !small), Piggy Smalls (!small), Hopscotch (!small),
    Cinnabun (!small), Honey Bun (!small), Bunsen Burner (!small), Nibbles McGee (!small), Squeakspeare (m !small),
    Monty Python (m !reptile), Tortellini (!reptile), Tortilla (!reptile), Shellby (f !reptile), Shelldon (m !reptile),
    Lizzo (f !reptile), Iggy Pop (m !reptile), Crawl Stewart (m !reptile), Hissy Fit (!reptile), Sir Scales (m !reptile),
    Mane Event (!horse), Trotsky (m !horse), Hayden (m !horse), Neigh Sayer (!horse), Pony Soprano (m !horse),
    Clip Clop (!horse), Oats (!horse), Hay Day (!horse), Mare-y Poppins (f !horse), Gallop Gertie (f !horse)` },

  { id: 'space', label: 'Space', weird: 1, names: `
    Luna (f grey white), Nova (f), Comet (bouncy), Cosmo (m), Orbit, Apollo (m), Jupiter (big), Juno (f), Stella (f), Astro (m dog),
    Pluto (m tiny), Nebula (f), Sirius (m dog), Vega (f), Orion (m), Andromeda (f), Rocket (bouncy), Sputnik (m), Laika (f dog),
    Halley (f), Galileo (m), Kepler (m), Titan (big), Callisto (f), Mars (m ginger), Saturn (m), Mercury (grey), Venus (f),
    Starla (f), Celeste (f), Cassini, Hubble, Quasar, Pulsar, Meteor (bouncy), Eclipse (black), Aurora (f), Solstice, Equinox,
    Zenith, Gemini, Ursa (f big), Rigel, Polaris (white), Moon Pie, Stardust, Asteroid, Buzz (m), Yuri (m), Io, Europa (f),
    Ganymede, Nebby, Cosmic, Rover, Sol (golden), Neptune (m fish), Mars Bar (brown), Space Cadet (chaotic), Blackhole (black)` },

  { id: 'myth', label: 'Gods & myths', weird: 2, names: `
    Zeus (m big), Athena (f clever), Apollo (m golden), Loki (m chaotic), Thor (m big), Odin (m), Freya (f), Hermes (m bouncy),
    Artemis (f), Hera (f posh), Persephone (f), Ares (m), Pan (m), Minerva (f clever), Achilles (m), Hercules (m big),
    Medusa (f reptile chaotic), Pegasus (horse white), Phoenix (ginger bird), Gaia (f), Osiris (m), Anubis (m black dog),
    Ra (m golden), Bastet (f !cat), Sekhmet (f cat ginger), Fenrir (m big dog grey), Kraken (chaotic fish), Poseidon (m fish),
    Triton (m fish), Nyx (f black), Hades (m black), Cerberus (m big dog), Circe (f), Echo (f bird), Nike (f bouncy),
    Atlas (m big), Prometheus (m), Hector (m), Ajax (m), Odysseus (m clever), Calypso (f), Merlin (m clever), Morgana (f),
    Lancelot (m), Guinevere (f), Valkyrie (f), Baldur (m), Sphinx (cat), Griffin (m), Hydra (reptile), Basilisk (reptile),
    Cupid (m sweet), Aphrodite (f), Dionysus (m), Hestia (f sleepy), Selene (f white), Helios (m golden), Eos (f),
    Thalia (f), Clio (f), Iris (f), Ember (ginger), Mjolnir, Bragi (m), Ragnar (m big), Beowulf (m big), Grendel (big chaotic)` },

  { id: 'nature', label: 'Nature', weird: 1, names: `
    Willow (f), Moss, Clover (f), Fern (f), Maple (f golden brown), Aspen (f), Birch (white), Hazel (f brown), Juniper (f),
    Sage, Ivy (f), Poppy (f ginger), Daisy (f), Lily (f white), Violet (f shy), Iris (f), Heather (f), Pebble (tiny grey),
    River, Brook (f), Storm (grey chaotic), Misty (f grey), Sky (f), Rain (f grey), Sunny (golden bouncy), Breezy (bouncy),
    Thunder (big chaotic), Cloud (white sleepy), Frost (white), Blizzard (white chaotic), Ember (ginger), Ash (grey),
    Flint (grey m), Stone (grey), Canyon, Meadow (f), Acorn (brown tiny), Pinecone (brown), Thistle (f), Bramble, Nettle (grumpy),
    Hickory (brown), Cedar (brown), Oakley, Rowan, Robin (bird), Wren (bird), Sparrow (bird brown), Fox (ginger),
    Wolf (grey big), Otter (brown), Badger (grey stripy grumpy), Magpie (spotty black white chaotic), Raven (black), Crow (black),
    Marigold (golden), Sunflower (golden), Tulip (f), Petal (f tiny), Blossom (f), Bluebell (f), Snowdrop (white), Primrose (f),
    Dandelion (golden), Buttercup (golden), Cricket (bouncy tiny), Firefly, Bumble (bouncy), Moth (grey), Beetle (black),
    Ladybug (spotty), Twig (tiny), Timber (big), Boulder (big), Tundra (white), Glacier (white), Monsoon, Typhoon (chaotic),
    Tornado (chaotic), Hurricane (chaotic), Drizzle (grey), Puddle (tiny), Coral (fish ginger), Kelp (fish), Reef (fish),
    Pebbles (grey), Dusk (grey), Dawn (f), Autumn (f ginger), Winter (white), Summer (f golden), Solstice, Sequoia (big)` },

  { id: 'colours', label: 'Colours & gems', weird: 1, names: `
    Ruby (f ginger), Opal (f white), Jasper (m), Onyx (black), Jade (f), Amber (f golden ginger), Pearl (f white), Sapphire (f),
    Topaz (golden), Garnet, Indigo, Saffron (ginger), Scarlet (f ginger), Ebony (f black), Ivory (f white), Coco (brown),
    Rusty (ginger), Copper (ginger), Goldie (golden), Silver (grey), Blue (grey), Smoky (grey black), Shadow (black), Sooty (black),
    Snowy (white), Cinnamon (brown), Pepper (spotty), Ash (grey), Caramel (golden brown), Honey (golden), Crimson, Cobalt,
    Teal, Olive, Hazel (brown), Umber (brown), Sienna (ginger f), Ochre (golden), Russet (ginger), Tawny (golden), Slate (grey),
    Pewter (grey), Charcoal (grey black), Graphite (grey), Obsidian (black), Jet (black), Midnight (black), Inky (black),
    Licorice (black), Raven (black), Coal (black), Snowflake (white), Cotton (white), Frosty (white), Casper (white), Ghost (white),
    Blondie (golden), Sandy (golden), Fawn (golden f), Chestnut (brown), Walnut (brown), Mahogany (brown ginger), Bronze (brown golden),
    Brass (golden), Diamond (white posh), Emerald (f), Amethyst (f), Quartz, Beryl (f), Agate, Coral (f ginger), Turquoise,
    Peridot, Calico (spotty !cat), Tabby (stripy cat), Tux (black white), Tuxedo (black white posh), Patches (spotty),
    Dotty (spotty f), Freckles (spotty), Speckles (spotty), Dapple (spotty horse), Pinto (spotty horse), Brindle (stripy dog),
    Stripes (stripy), Zebra (stripy), Humbug (stripy black white), Barcode (stripy), Pixel (spotty), Jigsaw (spotty),
    Confetti (spotty bouncy), Domino (spotty black white), Panda (black white), Skunk (black white chaotic), Salt (white),
    Marmalade (ginger !cat), Mango (ginger golden), Tango (ginger), Apricot (ginger), Ginger Snap (ginger), Rusty Nail (ginger)` },

  { id: 'music', label: 'Musicians', weird: 2, names: `
    Elvis (m), Dolly (f), Ziggy (m), Bowie (m), Prince (m posh), Mozart (m clever bird), Bach (m), Beethoven (m big),
    Ringo (m), Lennon (m), Marley (m), Johnny Cash (m black), Willie (m), Janis (f), Dylan (m), Presley (m), Aretha (f),
    Freddie (m), Cher (f), Madonna (f), Jagger (m), Stevie (m), Elton (m), Otis (m), Etta (f), Nina (f), Ella (f), Billie (f),
    Satchmo (m), Miles (m), Coltrane (m), Mingus (m), Dizzy (m bouncy), Thelonious (m), Banjo, Ukulele, Tuba (big), Fiddle,
    Piccolo (tiny), Bongo, Tambourine (bouncy), Cello (f), Jazz, Blues (grey), Disco (bouncy), Tango (ginger), Salsa (ginger),
    Mambo, Polka (spotty), Waltz, Reggae, Punk (chaotic), Riff, Lyric, Melody (f), Harmony (f), Chopin (m posh), Vivaldi (m),
    Handel (m), Haydn (m), Brahms (m), Puccini (m), Verdi (m), Schubert (m), Joni (f), Patsy (f), Loretta (f), Reba (f),
    Garth (m), Waylon (m), Kenny (m), Shania (f), Adele (f), Rihanna (f), Beyonce (f), Bono (m), Sting (m), Bjork (f),
    Ozzy (m chaotic), Slash (m chaotic), Axl (m), Kurt (m), Tupac (m), Biggie (m big), Snoop (m), Dre (m), Iggy (m), Mick (m),
    Keith (m), Paul (m), Nico (f), Lizzo (f), Dolly Parton (f), Bruce (m), Springsteen (m), Hendrix (m), Jimi (m), Joplin (f)` },

  { id: 'books', label: 'Books & films', weird: 2, names: `
    Atticus (m clever), Gatsby (m posh), Scout (f), Bilbo (m tiny), Frodo (m tiny), Gandalf (m grey clever), Watson (m),
    Sherlock (m clever), Poirot (m posh), Matilda (f clever), Heidi (f), Pippi (f chaotic), Wednesday (f black), Dracula (m black),
    Moby (white big), Darcy (m posh), Huck (m), Alice (f), Hatter (chaotic), Cheshire (!cat stripy), Aslan (m golden big),
    Eeyore (grey grumpy), Paddington (m brown), Toad (chaotic reptile), Mowgli (m), Baloo (m big sleepy), Bagheera (black cat),
    Ahab (m), Ishmael (m), Quixote (m), Sancho (m), Hermione (f clever), Hagrid (m big), Dobby (m tiny), Samwise (m), Pippin (m tiny),
    Merry (bouncy), Gollum (grey), Aragorn (m), Legolas (m), Gimli (m), Yoda (m tiny clever), Chewie (m big brown), Leia (f),
    Luke (m), Han Solo (m), Ewok (tiny brown), Groot (m brown), Totoro (grey big sleepy), Kiki (f black), Calcifer (ginger chaotic),
    Buzz (m), Woody (m brown), Jessie (f), Olaf (white), Sven (m), Hobbes (m stripy ginger), Calvin (m chaotic), Linus (m),
    Schroeder (m), Tintin (m), Asterix (m), Obelix (m big), Gulliver (m), Marple (f), Wooster (m), Heathcliff (m grumpy),
    Rochester (m), Emma (f), Scarlett (f), Rhett (m), Holden (m), Ramona (f), Beezus (f), Anne (f), Gilbert (m), Marilla (f),
    Jo (f), Meg (f), Laurie (m), Estella (f), Havisham (f grumpy), Fagin (m), Scrooge (m grumpy), Tiny Tim (m tiny),
    Jekyll (m), Hyde (m chaotic), Frankenstein (m big), Igor (m), Morticia (f black), Gomez (m), Pugsley (m), Lurch (m big),
    Cousin Itt (tiny), Elvira (f black), Beetlejuice (chaotic), Gremlin (chaotic), Mogwai (small), Indiana (m), Marty (m),
    Doc (m), Ferris (m), Maverick (m), Goose (m), Stay Puft (white big), Wall-E (m), Rocky Balboa (m), Mad Max (m chaotic),
    Ripley (f), Furiosa (f), Neo (m black), Trinity (f), Arwen (f), Galadriel (f posh), Bellatrix (f black chaotic), Dumbledore (m clever)` },

  { id: 'science', label: 'Scientists', weird: 2, names: `
    Newton (m clever), Tesla (m), Curie (f clever), Darwin (m), Einstein (m clever), Pascal (m), Kepler (m), Galileo (m),
    Edison (m), Ada (f clever), Lovelace (f), Hawking (m), Sagan (m), Hubble, Faraday (m), Atom (tiny), Proton, Neutron,
    Quark (tiny), Pixel (tiny), Byte (tiny), Nano (tiny), Turing (m), Nikola (m), Marie (f), Rosalind (f), Franklin (m),
    Mendel (m), Pavlov (m !dog), Schrodinger (!cat), Bunsen (m), Beaker, Hypatia (f), Archimedes (m), Euclid (m),
    Pythagoras (m), Fibonacci, Copernicus (m), Goodall (f), Attenborough (m posh), Carbon (black), Neon (bouncy),
    Helium (bouncy), Argon, Cobalt (grey), Copper (ginger), Zinc (grey), Titanium (big grey), Gamma, Sigma, Delta, Omega,
    Pi (tiny), Photon (bouncy), Vector, Fractal, Quantum, Enigma (clever), Cipher, Nobel (m), Hopper (f), Lamarr (f),
    Katherine (f), Mae Jemison (f), Rutherford (m), Bohr (m), Planck (m), Fermi (m), Heisenberg (m), Feynman (m), Oppenheimer (m)` },

  { id: 'places', label: 'Places', weird: 1, names: `
    Dakota, Brooklyn (f), Austin (m), Denver (m), Phoenix, Tulsa, Memphis (m), Paris (f), Rio (bird), Sydney (f), Cairo, Tokyo,
    Kyoto (f), Oslo, Lima, Havana (f), Dublin (m), Boston (m), Chelsea (f), Savannah (f), Sahara (f golden), Everest (big),
    Hudson (m), Tahoe, Yukon (big white), Juneau, Reno, Fargo, Montana, Arizona (f), Sierra (f), Bali, Fiji, Capri (f),
    Siena (f), Verona (f), Milan (m), Florence (f), Vienna (f), Geneva (f), Sofia (f), Valencia (f), Seville, Madrid, Lisbon,
    Porto, Bristol, York, Devon, Jersey, Guernsey (brown white), Shetland (tiny horse), Alaska (white big), Denali (big),
    Kodiak (big brown), Sonoma, Napa, Malibu (golden), Tucson, Boise, Cheyenne (f), Sedona (f ginger), Vegas (chaotic),
    Orlando (m), Miami (f), Nola (f), Georgia (f), Carolina (f), Virginia (f), Kansas, Texas (big), Houston, Dallas (m),
    Brixton, Camden, Soho, Kensington (posh), Mayfair (posh f), Windsor (posh m), Tulum, Oaxaca, Bogota, Patagonia,
    Kathmandu, Timbuktu (chaotic), Zanzibar, Casablanca, Marrakesh, Bombay (black !cat), Goa, Manila, Seoul, Osaka,
    Fuji, Tahiti, Maui (m), Kona, Oahu, Aspen, Zion, Yosemite, Sequoia (big), Olympia (f), Athens, Troy (m), Rome, Florence` },
];

// Roughly ranked from the pet-name lists insurers and pet-sitting sites publish each year.
// Used to tell you how many others will turn around at the park.
export const POPULAR = {
  dog: `Luna Bella Max Charlie Cooper Milo Daisy Lucy Teddy Rocky Bailey Buddy Sadie Molly Bear Stella Tucker Duke Oliver
    Leo Lola Zoe Nala Coco Rosie Penny Ruby Winnie Maggie Loki Ollie Finn Louie Gus Jack Toby Murphy Zeus Chloe Lily Sophie
    Roxy Gracie Ellie Willow Piper Kona Hazel Moose Riley Bentley Ace Oscar Mia Harley Bruno Archie Henry Dexter Frankie Remy
    Blue Koda Scout Marley Abby Honey Olive Nova Ziggy Cash Hank Otis Apollo Thor Diesel Sam Sammy Buster Bandit Rusty Ginger
    Minnie Pepper Poppy Mabel George Theo Arlo Benji Rex`,
  cat: `Luna Oliver Leo Milo Charlie Simba Max Jack Loki Tiger Jasper Ollie Oscar George Buddy Toby Smokey Finn Felix Simon
    Shadow Bella Lily Lucy Nala Kitty Chloe Stella Zoe Lola Cleo Daisy Sophie Mia Coco Pepper Gracie Willow Callie Misty
    Ginger Salem Pumpkin Binx Mittens Tigger Garfield Midnight Oreo Sassy Boots Socks Whiskers Kiki Olive Mochi Nova Pickles`,
  small: `Oreo Coco Peanut Thumper Clover Nibbles Biscuit Hazel Bun Pumpkin Cookie Daisy Pepper Ginger Snowball Luna`,
  bird: `Kiwi Mango Sunny Charlie Rio Polly Pip Blue Sky Tweety Pepper Coco Peaches Buddy Birdie`,
  fish: `Nemo Bubbles Goldie Dory Finn Gill Jaws Wanda Flounder Sushi`,
  reptile: `Spike Rex Iggy Shelly Godzilla Draco Ziggy Yoshi Sheldon Leo`,
  horse: `Buddy Duke Dusty Blaze Star Spirit Thunder Bella Champ Rocky Charlie Lucky`,
};

// Everything below is built from the lists above.

const SPECIES_IDS = SPECIES.map(s => s.id);

function parse() {
  const byKey = new Map();
  for (const theme of THEMES) {
    for (const raw of theme.names.split(',')) {
      const m = raw.trim().match(/^(.*?)\s*(?:\(([^)]*)\))?$/);
      if (!m || !m[1]) continue;
      const name = m[1].trim();
      const key = name.toLowerCase();
      let e = byKey.get(key);
      if (!e) {
        e = { name, sex: null, themes: [], coats: [], traits: [], size: null, species: [], only: [] };
        byKey.set(key, e);
      }
      if (!e.themes.includes(theme.id)) e.themes.push(theme.id);
      for (const t of (m[2] || '').split(/\s+/).filter(Boolean)) {
        if (t === 'm' || t === 'f') e.sex = e.sex && e.sex !== t ? null : t;
        else if (COATS.includes(t)) { if (!e.coats.includes(t)) e.coats.push(t); }
        else if (TRAITS.includes(t)) { if (!e.traits.includes(t)) e.traits.push(t); }
        else if (t === 'tiny' || t === 'big') e.size = t;
        else if (t.startsWith('!') && SPECIES_IDS.includes(t.slice(1))) { if (!e.only.includes(t.slice(1))) e.only.push(t.slice(1)); }
        else if (SPECIES_IDS.includes(t)) { if (!e.species.includes(t)) e.species.push(t); }
        else throw new Error(`Unknown tag "${t}" on ${name}`);
      }
    }
  }
  return [...byKey.values()];
}

export const NAMES = parse();
export const BY_NAME = new Map(NAMES.map(e => [e.name.toLowerCase(), e]));
export const THEME_BY_ID = new Map(THEMES.map(t => [t.id, t]));

export const POPULAR_RANK = Object.fromEntries(Object.entries(POPULAR).map(([sp, list]) => {
  const words = list.split(/\s+/).filter(Boolean);
  return [sp, new Map(words.map((w, i) => [w.toLowerCase(), i + 1]))];
}));

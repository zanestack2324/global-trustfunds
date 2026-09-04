// Global Trustfunds - shared property catalog
window.PROPERTIES = [
  {
    id: "meridian",
    name: "The Meridian Residences",
    type: "Residential",
    location: "Downtown Austin, TX",
    apy: "13.4",
    term: "24 months",
    min: 100,
    funded: 78,
    raised: "1.8M",
    goal: "2.3M",
    img: "assets/prop-residential.jpg"
  },
  {
    id: "skyline",
    name: "Skyline Business Park",
    type: "Commercial",
    location: "Midtown, Atlanta",
    apy: "14.1",
    term: "36 months",
    min: 100,
    funded: 54,
    raised: "2.4M",
    goal: "4.4M",
    img: "assets/prop-commercial.jpg"
  },
  {
    id: "harbor",
    name: "Harbor View Estates",
    type: "Luxury",
    location: "Waterfront, Miami",
    apy: "12.8",
    term: "30 months",
    min: 100,
    funded: 91,
    raised: "3.1M",
    goal: "3.4M",
    img: "assets/prop-luxury.jpg"
  },
  {
    id: "oakwood",
    name: "Oakwood Family Homes",
    type: "Residential",
    location: "North Dallas, TX",
    apy: "12.2",
    term: "24 months",
    min: 100,
    funded: 46,
    raised: "920K",
    goal: "2.0M",
    img: "assets/prop-4.jpg"
  },
  {
    id: "gateway",
    name: "The Gateway Offices",
    type: "Commercial",
    location: "Capital District, Raleigh",
    apy: "13.0",
    term: "30 months",
    min: 100,
    funded: 63,
    raised: "1.5M",
    goal: "2.4M",
    img: "assets/prop-5.jpg"
  },
  {
    id: "vista",
    name: "Vista Ridge Apartments",
    type: "Residential",
    location: "Scottsdale, AZ",
    apy: "11.9",
    term: "24 months",
    min: 100,
    funded: 81,
    raised: "2.9M",
    goal: "3.6M",
    img: "assets/prop-6.jpg"
  }
];

window.propertyCard = function (p) {
  return (
    '<article class="prop">' +
      '<div class="prop__media">' +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" />' +
        '<span class="prop__tag">' + p.type + '</span>' +
      '</div>' +
      '<div class="prop__body">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="prop__loc">' + p.location + '</p>' +
        '<div class="prop__meta">' +
          '<div><span>Target APY</span><b class="gold">' + p.apy + '%</b></div>' +
          '<div><span>Term</span><b>' + p.term + '</b></div>' +
          '<div><span>Min</span><b>$' + p.min + '</b></div>' +
        '</div>' +
        '<div class="prop__progress">' +
          '<div class="prop__progress-label"><span>Funded</span><span>' + p.funded + '%</span></div>' +
          '<div class="prop__bar"><i style="width:' + p.funded + '%"></i></div>' +
        '</div>' +
        '<div class="prop__foot">' +
          '<span>$' + p.raised + ' raised of $' + p.goal + '</span>' +
          '<span class="prop__actions">' +
          '<a href="signup.html?invest=' + p.id + '" class="btn btn--gold btn--sm">Invest</a>' +
          '<button type="button" class="btn btn--outline btn--sm invest-chain" data-propid="' + p.id + '" data-propname="' + p.name + '" data-apy="' + p.apy + '">On Chain</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
};

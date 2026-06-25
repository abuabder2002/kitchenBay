const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newTestimonials = [
    { name: "Michelle Rose", text: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1", productImg: "/artisan_kitchenware.png" },
    { name: "Paras Chugh", text: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!", rating: 5, avatar: "https://i.pravatar.cc/150?img=11", productImg: "/artisan_crafting_brass.png" },
    { name: "Prabhas Upadhyay", text: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.", rating: 5, avatar: "https://i.pravatar.cc/150?img=33", productImg: "/artisan_hammering_copper.png" },
    { name: "Jayavant Jadhav", text: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!", rating: 5, avatar: "https://i.pravatar.cc/150?img=60", productImg: "/artisan_forging_cast_iron.png" },
  ];

  await prisma.siteContent.updateMany({
    where: { key: 'testimonials', page: 'home' },
    data: { value: JSON.stringify(newTestimonials) }
  });
  
  console.log("Updated testimonials successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

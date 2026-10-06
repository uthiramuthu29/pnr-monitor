type PageHeadingProps = {
    title: string,
    desc: string
}

export default function PageHeading({ title, desc }: PageHeadingProps){
    return (
        <div className="page-heading mb-4 ">
            <h2 className="text-[30px] leading-9 font-plus font-bold text-navy-dark "  >{title}</h2>
            <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash ">{desc}</p>
        </div>
    )
}
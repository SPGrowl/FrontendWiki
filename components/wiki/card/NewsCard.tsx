 export interface resource{
    title:string;
    herf:string;
    type:string;
    imgURL:string;
    creator:string;
    updateTime:string;
}
export function NewsCard({resources}:{resources:resource[]})


{
    return (
        <>
        <section className="flex gap-2 flex-wrap flex-2">

        {resources.map((resource)=>(        
            <div key={resource.herf} className="flex-1 box-border min-h-[250px] flex flex-col rounded-md bg-[#2a2a2a]">
            <div
                className="h-[70%] shrink-0 bg-white bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${resource.imgURL})` }}
                role="img"
                aria-label={resource.title}
            />
            {/* 文字区 */}
            {/* spacing:0.25re,=4px */}
            <div className="flex flex-col justify-between px-3.5 py-2.5 text-white bg-[#2a2a2a]  	
flex-1">
              <div className="text-sm line-clamp-2 font-medium leading-snug"
                >{resource.title}</div>
                <footer className="flex justify-between gap-3 text-xs text-[#b3b3b3]">
                    {/* creator */}
                    <span className="truncate">{resource.creator}</span>
                    {/* updateTime */}
                    <span className="truncate">{resource.updateTime}</span>
                </footer>
            </div>
        </div>))}



        </section>
        </>
    )
}
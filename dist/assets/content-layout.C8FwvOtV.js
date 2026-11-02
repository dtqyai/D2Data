// Local database layout: preserve database slots without portal promotions.
import { a as h, b as isMobile } from './index-nyHDpP-q.js';
const scope={'data-v-363fabb3':''};
const div=(name,children,props={})=>h('div',{...scope,class:name,...props},children);
const ContentLayout={name:'ContentLayout',props:{size:{default:'normal'},headerStyle:{default:''}},data:()=>({backTopVisible:false}),mounted(){this.onScroll=()=>{this.backTopVisible=window.scrollY>500};window.addEventListener('scroll',this.onScroll,{passive:true})},beforeUnmount(){window.removeEventListener('scroll',this.onScroll)},render(){const s=this.$slots;return div('content-layout',[
 div('content-layout__shell-wrap',[
 s.header?div('content-layout__header',[div('content-layout__header-inner',s.header())],{style:this.headerStyle}):null,
 div('content-layout__shell',[
 div('content-layout__main',s.default?.()),
 !isMobile&&s.sidebar?div('content-layout__sidebar',s.sidebar()):null
 ])]),
 this.backTopVisible?h('button',{class:'offline-backtop',title:'返回顶部',onClick:()=>window.scrollTo({top:0,behavior:'smooth'})},'↑'):null
])}};
export {ContentLayout as _};

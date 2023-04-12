module.exports = {
  messages: {
    CN: {
      home: {name: '메인'},
    },
    US: {
      home: {name: 'home'},
      user: {name: '사용자관리',
        list: {name: '리스트'},
      }
    },
    KO: {
      setting: {name: '설정',
        base: {name: '기본 설정'},
        security: {name: '보안 설정'},
        custom: {name: '개인 설정'},
      },
      workplace: {name: '워크플레이스'},
      user: {
        name: '사용자관리',
        user: {
          list: {name: '사용자 리스트'},
        },
      },
      board: {
        name: '게시판 관리',
        board: {
          board: {name: '게시판 관리'},
        },
      },
      system: {
        name: '시스템 관리',
          system: {
            users: {name: '사용자관리'},
            users2: {name: '사용자관리2'},
            menus: {name: '메뉴관리'},
            roles: {name: 'ROLE관리'},
            logs: {name: '시스템로그'},
            SysRoleCt: {name: '권한별 센터관리'},
          },
      },
      master : {
        name : '마스터관리',
        master:{
          CommonCode: {name: '관리기준코드'},
          MstIc: {name: '품목 관리'},
          MstCt: {name: '센터 관리'},
          MstDrvr: {name: '차량정보관리'},
          MstAc: {name: '거래처관리'},
          MstZn: {name: '존_로케이션관리'},
          MstPda: {name: 'PDA 관리'},
        }
      },
      inbound : {
        name : '입고 관리',
        inbound:{
          InboundOrder: {name: '입고 지시'},
          InbSchConf: {name: '입고예정&입고확정'},
          QcJdgmnt: {name: 'QC판정'},
        }
      },
      inventory : {
        name : '재고 관리',
        inventory:{
          InventoryUpload: {name: '재고 업로드'},
          workControl: {name: '작업지시 관리'},
          workOrderCreate: {name: '작업지시 생성'},
        }
      },
      outbound : {
        name : '출고 관리',
        inbound:{
          OutboundOrder: {name: '출고지시서 생성'},
        }
      },
    }
  }
}

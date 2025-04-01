//
//  HomeView.swift
//  Me Adota
//
//  Created by Anderson Sprenger on 01/04/25.
//

import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                HStack {
                    Text("Meus Pets")
                        .font(.title)
                        .bold()
                    
                    Spacer()
                    
                    Text("Ver todos")
                }
                .padding(.horizontal)
                
                ScrollView(.horizontal) {
                    HStack {
                        ForEach(0..<10) { i in
                            Image("dog")
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 100, height: 150)
                                .cornerRadius(8)
                        }
                    }
                    .padding(.leading)
                    .padding(.vertical)
                }
                
                HStack {
                    Text("Monitoramentos")
                        .font(.title)
                        .bold()
                    
                    Spacer()
                    
                    Text("Ver todos")
                }
                .padding(.horizontal)
                
                ScrollView(.horizontal) {
                    HStack {
                        ForEach(0..<10) { i in
                            Image("dog")
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 100, height: 150)
                                .cornerRadius(8)
                        }
                    }
                    .padding(.leading)
                    .padding(.vertical)
                }

                
                Spacer()
                
            }
            .navigationTitle("Me Adota")

        }
    }
}

#Preview {
    HomeView()
}
